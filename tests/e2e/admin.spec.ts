import { test, expect } from '@playwright/test'

async function openNavigation(page: import('@playwright/test').Page) {
  const toggle = page.getByRole('button', { name: '打开后台导航' })
  if (await toggle.isVisible()) await toggle.click()
}

async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login')
  await page.getByLabel('账号', { exact: true }).fill('admin')
  await page.getByLabel('密码', { exact: true }).fill('browser-test-password-only')
  await page.getByRole('button', { name: '登录后台' }).click()
  await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible()
}

async function pasteMarkdown(page: import('@playwright/test').Page, markdown: string) {
  const body = page.getByRole('textbox', { name: '文章正文', exact: true })
  await body.fill('')
  await body.focus()
  await body.evaluate((element, text) => {
    const clipboardData = new DataTransfer()
    clipboardData.setData('text/plain', text)
    // Match Markdown copied from a source editor that also provides styled HTML.
    clipboardData.setData('text/html', '<pre style="font-family: monospace">Markdown source</pre>')
    element.dispatchEvent(new ClipboardEvent('paste', { clipboardData, bubbles: true, cancelable: true }))
  }, markdown)
}

test('login, article manual save, preview and publication work on desktop and mobile', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
  await login(page)
  await page.screenshot({ path: testInfo.outputPath('article-list.png'), fullPage: true })
  await page.getByRole('button', { name: '新建文章' }).click()
  await expect(page.getByRole('heading', { name: '编辑文章' })).toBeVisible()
  const slug = `browser-${testInfo.project.name}-${Date.now()}`
  await page.getByLabel('标题', { exact: true }).fill('浏览器编辑验证')
  await page.getByLabel('摘要', { exact: true }).fill('在浏览器里编辑、预览和发布文章。')
  await page.getByLabel('文章地址', { exact: true }).fill(slug)
  await pasteMarkdown(page, '## 浏览器中的思考\n\n这是尚未发布的内容。\n\n```ts\nconst answer = 42\n```')
  await page.getByRole('button', { name: '选择文章封面' }).click()
  await page.locator('input[type="file"]').setInputFiles('public/images/personal/notebook.jpg')
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 })
  const uploadedSrc = await page.locator('.admin-cover-picker img').getAttribute('src')
  await pasteMarkdown(
    page,
    `## 浏览器中的思考\n\n这是尚未发布的内容。\n\n![上传插图](${uploadedSrc})\n\n\`\`\`ts\nconst answer = 42\n\`\`\``,
  )
  await page.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect(page.locator('.admin-save-status')).toContainText('已保存', { timeout: 10_000 })
  const publicDraft = await page.request.get(`/writing/${slug}`)
  expect(publicDraft.status()).toBe(404)
  await expect(page.locator('.admin-inline-preview')).toHaveCount(0)
  await expect(page.getByLabel('文章正文').getByRole('heading', { name: '浏览器中的思考' })).toBeVisible()
  const notifications = page.locator('.admin-notifications')
  const placement = await notifications.boundingBox()
  expect(placement!.y).toBe(page.viewportSize()!.width < 768 ? 16 : 20)
  expect(placement!.x + placement!.width / 2).toBeCloseTo(page.viewportSize()!.width / 2, 0)
  await page.locator('.admin-editor-heading h1').click()
  await page.screenshot({ path: testInfo.outputPath('article-editor.png'), fullPage: true })
  await page.locator('.admin-editor-actions').getByRole('button', { name: '预览', exact: true }).click()
  await expect(
    page.frameLocator('.admin-preview-frame').getByRole('heading', { name: '浏览器编辑验证', exact: true }),
  ).toBeVisible()
  await expect(
    page.frameLocator('.admin-preview-frame').locator('.code-block pre code .line span').first(),
  ).toBeVisible()
  await page.getByRole('button', { name: '手机', exact: true }).click()
  await expect(page.locator('.admin-preview-frame')).toHaveCSS('width', '390px')
  await expect(
    page.frameLocator('.admin-preview-frame').getByRole('heading', { name: '浏览器编辑验证', exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('article-preview.png'), fullPage: true })
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.getByRole('button', { name: '发布文章' }).click()
  await expect(page.getByRole('status').filter({ hasText: '文章已发布' })).toBeVisible()
  const published = await page.request.get(`/writing/${slug}`)
  expect(published.status()).toBe(200)
  expect(await published.text()).toContain('浏览器中的思考')
  const publicPage = await page.context().newPage()
  await publicPage.goto(`/writing/${slug}`)
  await publicPage.locator('.article-opening-photo').evaluate((image: HTMLImageElement) => image.decode())
  await publicPage
    .getByAltText('上传插图', { exact: true })
    .evaluate((image: HTMLImageElement) => image.decode())
  await publicPage.close()
  await expect(page.getByLabel('文章地址', { exact: true })).toBeDisabled()
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  ).toBe(true)
  expect(errors).toEqual([])
})

test('homepage controls, image library, theme and logout are usable', async ({ page }, testInfo) => {
  await login(page)
  await openNavigation(page)
  await page
    .getByRole('navigation', { name: '后台导航' })
    .getByRole('link', { name: '首页', exact: true })
    .click()
  await expect(page.getByRole('heading', { name: '生活照片 5' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '便签话术 6' })).toBeVisible()
  await expect(page.getByLabel('第 1 句话术', { exact: true })).toHaveValue(
    '比起标准答案，\n更想做点有意思的东西。',
  )
  await page.getByRole('button', { name: '预览首页' }).click()
  const preview = page.frameLocator('.admin-preview-frame')
  await expect(preview.locator('body')).toContainText('01 / 05')
  await preview.getByRole('button', { name: '翻看下一张生活照片' }).click()
  await expect(preview.locator('body')).toContainText('02 / 05')
  await preview.getByRole('button', { name: '换一个想法' }).click()
  await expect(preview.locator('body')).toContainText('先做一个小小的版本')
  await page.getByRole('button', { name: '手机', exact: true }).click()
  await expect(preview.locator('.desk-canvas')).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('home-preview.png'), fullPage: true })
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.screenshot({ path: testInfo.outputPath('home-editor.png'), fullPage: true })
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  await openNavigation(page)
  await page
    .getByRole('navigation', { name: '后台导航' })
    .getByRole('link', { name: '图片', exact: true })
    .click()
  await expect(page.locator('.admin-media-card').filter({ hasText: '网站素材' })).toHaveCount(8)
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(32, 35, 33)')
  await expect(page.locator('.admin-media-card').first()).not.toContainText('0 × 0')
  await page.locator('.admin-media-image').first().click()
  await expect(page.getByRole('dialog').locator('.admin-media-original img')).toBeVisible()
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.screenshot({ path: testInfo.outputPath('media-dark.png'), fullPage: true })
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  ).toBe(true)
  await page.getByRole('button', { name: '退出登录' }).click()
  await expect(page).toHaveURL('/admin/login')
  expect((await page.request.get('/api/admin/home')).status()).toBe(401)
})

test('Vuetify dialogs, history and responsive layouts preserve focus and fit the viewport', async ({
  page,
  isMobile,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await login(page)
  await expect(
    page.locator('.admin-article-row').first().getByRole('button', { name: '移入回收站' }),
  ).toHaveClass(/text-error/)
  await page.locator('.admin-article-row').first().getByRole('button', { name: '移入回收站' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toContainText('移入回收站')
  await expect(dialog).not.toContainText('XIAOTONG / WORKSPACE')
  await expect(dialog.getByRole('button', { name: '取消' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(dialog).toHaveCount(0)
  await expect(
    page.locator('.admin-article-row').first().getByRole('button', { name: '移入回收站' }),
  ).toBeFocused()
  // New drafts can push published fixtures onto later pages during parallel runs.
  await page.getByRole('tab', { name: /^已发布/ }).click()
  await page
    .locator('.admin-article-row')
    .filter({ has: page.getByText('已发布', { exact: true }) })
    .first()
    .getByRole('link', { name: '编辑', exact: true })
    .click()
  await page.getByRole('button', { name: '查看发布历史' }).click()
  await expect(dialog.getByRole('heading', { name: '发布历史' })).toBeVisible()
  await page.screenshot({ path: testInfo.outputPath('history.png'), fullPage: true })
  const restore = dialog.getByRole('button', { name: '恢复到草稿' }).first()
  await expect(restore).toBeVisible()
  {
    await restore.click()
    await expect(page.getByRole('dialog').last()).toContainText('恢复历史版本')
    await page.getByRole('dialog').last().getByRole('button', { name: '取消' }).click()
    await expect(page.getByRole('dialog')).toHaveCount(1)
  }
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  if (!isMobile) {
    for (const width of [768, 1024, 1280, 1440]) {
      await page.setViewportSize({ width, height: 900 })
      await expect(page.getByLabel('标题', { exact: true })).toBeVisible()
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    }
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  const returnLink = page.getByRole('link', { name: '返回全部文章' })
  await expect(returnLink).toBeInViewport()
  await page.screenshot({ path: testInfo.outputPath('editor-return-scrolled.png') })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.getByRole('button', { name: '预览', exact: true }).first().click()
  await expect(page.frameLocator('.admin-preview-frame').locator('.writing-article-view')).toBeVisible()
  const header = page.locator('.admin-dialog-header')
  await page
    .frameLocator('.admin-preview-frame')
    .locator('body')
    .evaluate(() => window.scrollTo(0, document.body.scrollHeight))
  await expect(header.getByRole('button', { name: '关闭弹窗' })).toBeInViewport()
  await page.frameLocator('.admin-preview-frame').locator('.writing-article-view h1').click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await returnLink.click()
  await expect(page.getByRole('heading', { name: '文章', exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('login labels, borders and focus remain clear in both themes', async ({ page }, testInfo) => {
  await page.goto('/admin/login')
  const password = page.getByLabel('密码', { exact: true })
  await expect(page.locator('.admin-login-heading')).not.toContainText(/WELCOME BACK|YOUR OPEN NOTEBOOK/)
  await expect(page.locator('.admin-login-field > label')).toHaveText(['账号', '密码'])
  for (const field of await page.locator('.admin-login-field .v-field__outline__start').all()) {
    await expect(field).toHaveCSS('border-top-width', '1px')
    await expect(field).toHaveCSS('border-top-style', 'solid')
  }
  await password.fill('visible-password-example')
  await expect(password).toBeFocused()
  await expect(password).toHaveCSS('outline-style', 'none')
  await expect(page.locator('.admin-login-field .v-field--focused .v-field__outline__start')).toHaveCSS(
    'border-top-width',
    '2px',
  )
  await page.screenshot({ path: testInfo.outputPath('login-focus-light.png'), fullPage: true })
  await page.getByRole('button', { name: '显示密码' }).click()
  await expect(password).toHaveAttribute('type', 'text')
  await expect(password).toHaveValue('visible-password-example')
  await page.getByRole('button', { name: '隐藏密码' }).click()
  await expect(password).toHaveAttribute('type', 'password')
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(page.locator('.admin-login-card')).toHaveCSS('background-color', 'rgb(39, 43, 40)')
  await password.focus()
  await expect(password).toHaveCSS('outline-style', 'none')
  await page.screenshot({ path: testInfo.outputPath('login-focus-dark.png'), fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('menu navigation preserves the workspace and browser history without document reloads', async ({
  page,
}, testInfo) => {
  await login(page)
  await page.locator('.admin-header').evaluate((element) => {
    element.setAttribute('data-persistent-test', 'header')
  })
  await page.locator('.admin-sidebar').evaluate((element) => {
    element.setAttribute('data-persistent-test', 'sidebar')
  })
  const documents: string[] = []
  page.on('request', (request) => {
    if (request.isNavigationRequest() && request.resourceType() === 'document') documents.push(request.url())
  })
  for (const [menu, path] of [
    ['首页', '/admin/home'],
    ['图片', '/admin/media'],
    ['文章', '/admin'],
  ] as const) {
    await openNavigation(page)
    await page
      .getByRole('navigation', { name: '后台导航' })
      .getByRole('link', { name: menu, exact: true })
      .click()
    await expect(page).toHaveURL(path)
    await expect(page.locator('.admin-page-heading h1')).toHaveText(menu)
    await expect(page.locator('.admin-header')).toHaveAttribute('data-persistent-test', 'header')
    await expect(page.locator('.admin-sidebar')).toHaveAttribute('data-persistent-test', 'sidebar')
    await expect(page.locator('.admin-page-heading')).not.toContainText(
      /XIAOTONG \/ WORKSPACE|YOUR OPEN NOTEBOOK/,
    )
    if (menu === '首页') {
      const field = page.getByLabel('第 1 句话术', { exact: true })
      await field.focus()
      await expect(field).toHaveCSS('outline-style', 'none')
      await page.screenshot({ path: testInfo.outputPath('home-input-focus.png'), fullPage: true })
    }
  }
  await page.goBack()
  await expect(page).toHaveURL('/admin/media')
  await page.goForward()
  await expect(page).toHaveURL('/admin')
  await expect(page.locator('.admin-header')).toHaveAttribute('data-persistent-test', 'header')
  expect(documents).toEqual([])
})

test('combobox inputs and the Vuetify calendar use one focus border and preserve the calendar date', async ({
  page,
}, testInfo) => {
  await login(page)
  await page.getByRole('button', { name: '新建文章' }).click()
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  const category = page.getByRole('combobox', { name: '分类', exact: true })
  await category.click()
  await expect(category).toHaveCSS('outline-style', 'none')
  await expect(page.getByRole('listbox')).toBeVisible()
  await page.getByRole('option', { name: 'AI', exact: true }).click()
  await expect(category).toHaveValue('AI')
  const tags = page.getByRole('combobox', { name: '标签', exact: true })
  await tags.fill('focus-tag')
  await expect(tags).toHaveCSS('outline-style', 'none')
  await page.keyboard.press('Enter')
  await expect(page.locator('.v-combobox').filter({ has: tags })).toContainText('focus-tag')
  await tags.focus()
  await expect(tags).toHaveCSS('outline-style', 'none')
  await page.screenshot({ path: testInfo.outputPath('combobox-focus-dark.png'), fullPage: true })
  const date = page.getByLabel('发布日期', { exact: true })
  await expect(date).toHaveAttribute('type', 'text')
  const currentDate = await date.inputValue()
  const chosenDate = `${currentDate.slice(0, 8)}15`
  await date.click()
  const calendar = page.locator('.admin-date-menu .v-date-picker')
  await expect(calendar).toBeVisible()
  await expect(calendar.getByRole('button', { name: '下个月' })).toBeVisible()
  await expect(date).toHaveCSS('outline-style', 'none')
  await page.screenshot({ path: testInfo.outputPath('vuetify-calendar-dark.png'), fullPage: true })
  await calendar.locator(`[data-v-date="${chosenDate}"]`).click()
  await expect(calendar).not.toBeVisible()
  await expect(date).toHaveValue(chosenDate)
  await page.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect(page.locator('.admin-save-status')).toContainText('已保存', { timeout: 10_000 })
  const id = new URL(page.url()).pathname.split('/').at(-1)
  const saved = await page.request.get(`/api/admin/articles/${id}`)
  expect((await saved.json()).draft.date).toBe(chosenDate)
})

test('dialogs lock the background, restore its position and keep nested dialogs locked', async ({
  page,
}, testInfo) => {
  await login(page)
  await page
    .locator('.admin-article-row')
    .filter({ has: page.getByText('已发布', { exact: true }) })
    .first()
    .getByRole('link', { name: '编辑', exact: true })
    .click()
  const history = page.getByRole('button', { name: '查看发布历史' })
  await history.scrollIntoViewIfNeeded()
  const before = await page
    .locator('.admin-editor-heading')
    .evaluate((element) => element.getBoundingClientRect().top)
  await history.click()
  const root = page.locator('html')
  await expect(root).toHaveClass(/v-overlay-scroll-blocked/)
  await expect(root).toHaveCSS('position', 'fixed')
  await expect(root).toHaveCSS('overflow-y', 'hidden')
  await page.mouse.move(4, 100)
  await page.mouse.wheel(0, 1000)
  expect(
    await page.locator('.admin-editor-heading').evaluate((element) => element.getBoundingClientRect().top),
  ).toBeCloseTo(before, 0)
  await page.getByRole('dialog').getByRole('button', { name: '恢复到草稿' }).first().click()
  await expect(page.getByRole('dialog')).toHaveCount(2)
  await page.getByRole('dialog').last().getByRole('button', { name: '取消' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(1)
  await expect(root).toHaveClass(/v-overlay-scroll-blocked/)
  await page.screenshot({ path: testInfo.outputPath('history-background-locked.png') })
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await expect(root).not.toHaveClass(/v-overlay-scroll-blocked/)
  await expect(history).toBeFocused()
  expect(
    await page.locator('.admin-editor-heading').evaluate((element) => element.getBoundingClientRect().top),
  ).toBeCloseTo(before, 0)
  await page.mouse.move(4, 100)
  await page.mouse.wheel(0, -1000)
  await expect
    .poll(() =>
      page.locator('.admin-editor-heading').evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBeGreaterThan(before)
})

test('the workspace fills wide screens, photo cards fit mobile, and theme changes animate', async ({
  page,
  isMobile,
}, testInfo) => {
  await login(page)
  if (!isMobile) {
    for (const width of [1920, 3840]) {
      await page.setViewportSize({ width, height: 1000 })
      const content = await page.locator('.admin-content').boundingBox()
      expect(content!.x).toBe(236)
      expect(content!.width).toBe(width - 236)
    }
    await page.setViewportSize({ width: 1920, height: 1000 })
  }
  await openNavigation(page)
  await page
    .getByRole('navigation', { name: '后台导航' })
    .getByRole('link', { name: '首页', exact: true })
    .click()
  await expect(page.locator('.admin-home-photo')).toHaveCount(5)
  await expect(page.getByRole('button', { name: '上移第 1 张照片', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '下移第 5 张照片', exact: true })).toBeDisabled()
  await page.screenshot({ path: testInfo.outputPath('home-photo-cards.png'), fullPage: true })
  await page.getByRole('button', { name: '更换第 1 张照片', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.locator('html')).toHaveClass(/v-overlay-scroll-blocked/)
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => {
    const root = document.documentElement
    new MutationObserver(() => {
      if (root.classList.contains('theme-revealing')) root.dataset.themeAnimationObserved = 'true'
    }).observe(root, { attributes: true, attributeFilter: ['class'] })
  })
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme-animation-observed', 'true')
  await expect(page.locator('html')).not.toHaveClass(/theme-revealing/)
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(32, 35, 33)')
  await page.screenshot({ path: testInfo.outputPath('home-photo-cards-dark.png'), fullPage: true })
  await page.evaluate(() =>
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true }),
  )
  await page.getByRole('button', { name: '切换到浅色主题' }).click()
  await expect(page.locator('html')).toHaveClass(/theme-fading/)
  await expect(page.locator('html')).not.toHaveClass(/theme-fading/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('article edits stay local until manual save, including history, preview and edits during a save', async ({
  page,
}) => {
  await login(page)
  await page.getByRole('button', { name: '新建文章' }).click()
  await expect(page.getByRole('heading', { name: '编辑文章' })).toBeVisible()
  const id = new URL(page.url()).pathname.split('/').at(-1)
  const endpoint = `/api/admin/articles/${id}`
  const original = await (await page.request.get(endpoint)).json()
  const writes: unknown[] = []
  let releaseSave!: () => void
  const pauseSave = new Promise<void>((resolve) => {
    releaseSave = resolve
  })
  await page.route(`**${endpoint}`, async (route) => {
    if (route.request().method() === 'PUT') {
      writes.push(route.request().postDataJSON())
      if (writes.length === 1) await pauseSave
    }
    await route.continue()
  })
  const title = page.getByLabel('标题', { exact: true })
  await title.fill('只在当前页面编辑')
  await expect(page.locator('.admin-save-status')).toContainText('待保存')
  await page.getByRole('button', { name: '查看发布历史' }).click()
  await expect(page.getByRole('dialog')).toContainText('发布历史')
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.getByRole('button', { name: '预览', exact: true }).first().click()
  await expect(page.frameLocator('.admin-preview-frame').locator('h1')).toHaveText('只在当前页面编辑')
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  // Longer than the previous 1.5-second autosave debounce.
  await page.waitForTimeout(1800)
  expect(writes).toHaveLength(0)
  expect((await (await page.request.get(endpoint)).json()).draft.title).toBe(original.draft.title)
  await page.getByRole('button', { name: '发布文章', exact: true }).click()
  await expect(page.locator('.admin-toast-message[role="alert"]')).toContainText('请先点击「保存草稿」')
  expect(writes).toHaveLength(0)
  await page.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect.poll(() => writes.length).toBe(1)
  await title.fill('保存期间新增的修改')
  releaseSave()
  await expect(page.getByRole('button', { name: '保存草稿', exact: true })).toBeEnabled()
  await expect(page.locator('.admin-save-status')).toContainText('待保存')
  await page.waitForTimeout(1800)
  expect(writes).toHaveLength(1)
  expect((await (await page.request.get(endpoint)).json()).draft.title).toBe('只在当前页面编辑')
  await page.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect(page.locator('.admin-save-status')).toContainText('已保存')
  expect(writes).toHaveLength(2)
  expect((await (await page.request.get(endpoint)).json()).draft.title).toBe('保存期间新增的修改')
})

test('home edits require a manual save and unsaved menu changes can be cancelled', async ({ page }) => {
  // Both projects share a database, so keep this persistence check in one project.
  test.skip(test.info().project.name === 'admin-mobile')
  await login(page)
  await page.getByRole('link', { name: '首页', exact: true }).click()
  await expect(page.getByRole('heading', { name: '首页', exact: true })).toBeVisible()
  const original = await (await page.request.get('/api/admin/home')).json()
  const field = page.getByLabel(`第 ${original.draft.thoughts.length} 句话术`, { exact: true })
  const writes: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname === '/api/admin/home')
      writes.push(request.url())
  })
  await field.fill('手动保存的便签')
  await page.getByRole('button', { name: '查看首页发布历史' }).click()
  await page.getByRole('button', { name: '关闭弹窗' }).click()
  await page.waitForTimeout(1800)
  expect(writes).toHaveLength(0)
  expect((await (await page.request.get('/api/admin/home')).json()).draft).toEqual(original.draft)
  await page.getByRole('link', { name: '图片', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('未保存的修改')
  await page.getByRole('button', { name: '取消', exact: true }).click()
  await expect(page).toHaveURL('/admin/home')
  await expect(field).toHaveValue('手动保存的便签')
  await page.getByRole('button', { name: '保存草稿', exact: true }).click()
  await expect(page.locator('.admin-save-status')).toContainText('已保存')
  const saved = await (await page.request.get('/api/admin/home')).json()
  expect(saved.draft.thoughts.at(-1).text).toBe('手动保存的便签')
  expect(writes).toHaveLength(1)
  await page.request.put('/api/admin/home', {
    headers: { 'x-admin-request': '1', origin: new URL(page.url()).origin },
    data: { draft: original.draft, revision: saved.revision },
  })
})

test('dark and light workspace colors match the site after hard refresh and menu navigation', async ({
  page,
}, testInfo) => {
  await login(page)
  for (const theme of ['dark', 'light'] as const) {
    await page.getByRole('button', { name: theme === 'dark' ? '切换到深色主题' : '切换到浅色主题' }).click()
    for (const path of ['/admin/home', '/admin/media', '/admin']) {
      await page.goto(path)
      await expect(page.locator('.v-application')).toHaveClass(
        new RegExp(theme === 'dark' ? 'v-theme--adminDark' : 'v-theme--adminLight'),
      )
      const palette = await page.evaluate(() => ({
        background: getComputedStyle(document.body).backgroundColor,
        surface: getComputedStyle(document.documentElement).getPropertyValue('--site-surface-rgb').trim(),
      }))
      await expect(page.locator('.v-application')).toHaveCSS('background-color', palette.background)
      await expect(page.locator('.admin-header')).toHaveCSS('background-color', `rgb(${palette.surface})`)
      await expect(page.locator('.admin-sidebar')).toHaveCSS('background-color', `rgb(${palette.surface})`)
      await expect(page.locator('.admin-nav-list')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)')
      for (const card of await page.locator('.admin-page .v-card').all()) {
        await expect(card).toHaveCSS('background-color', `rgb(${palette.surface})`)
      }
    }
    await page.screenshot({ path: testInfo.outputPath(`refresh-${theme}.png`), fullPage: true })
  }
})

test('upload notifications dismiss automatically and can be closed manually', async ({ page }) => {
  await login(page)
  await openNavigation(page)
  await page.getByRole('link', { name: '图片', exact: true }).click()
  const input = page.getByLabel('上传图片文件', { exact: true })
  await input.setInputFiles('public/images/personal/notebook.jpg')
  const notification = page.locator('.admin-toast-message').filter({ hasText: '图片已上传' })
  await expect(notification).toBeVisible()
  await expect(notification).toHaveCount(0, { timeout: 7000 })
  await input.setInputFiles('public/images/personal/notebook.jpg')
  await expect(notification).toBeVisible()
  await notification.getByRole('button', { name: '关闭提示' }).click()
  await expect(notification).toHaveCount(0)
  await input.setInputFiles({
    name: 'invalid.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from('invalid image'),
  })
  await expect(page.locator('.admin-toast-message[role="alert"]')).toBeVisible()
  await page.locator('.admin-toast-message[role="alert"]').getByRole('button', { name: '关闭提示' }).click()
  await expect(page.locator('.admin-toast-message[role="alert"]')).toHaveCount(0)
})

test('recycle bin confirms permanent deletion and cancellation keeps the article', async ({
  page,
}, testInfo) => {
  await login(page)
  const headers = { 'x-admin-request': '1', origin: new URL(page.url()).origin }
  const title = `永久删除验证-${testInfo.project.name}-${Date.now()}`
  const created = await page.request.post('/api/admin/articles', {
    headers,
    data: {
      title,
      slug: `delete-check-${testInfo.project.name}-${Date.now()}`,
      description: '回收站永久删除验证',
      markdown: '## 需要彻底删除的正文\n\n删除后不再保留历史版本。',
      tags: [],
      category: '随想',
      cover: '/images/personal/notebook.jpg',
      date: '2026-01-01',
      featured: false,
    },
  })
  expect(created.ok()).toBe(true)
  const record = await created.json()
  const endpoint = `/api/admin/articles/${record.id}`
  expect(
    (await page.request.post(`${endpoint}/publish`, { headers, data: { revision: record.revision } })).ok(),
  ).toBe(true)
  await page.reload()
  await page.getByRole('searchbox', { name: '搜索文章' }).fill(title)
  const row = page.locator('.admin-article-row').filter({ hasText: title })
  await expect(row.getByRole('button', { name: '永久删除', exact: true })).toHaveCount(0)
  await row.getByRole('button', { name: '移入回收站', exact: true }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByRole('button', { name: '移入回收站', exact: true }).click()
  await expect(row).toHaveCount(0)
  await page.getByRole('tab', { name: /^回收站/ }).click()
  await expect(row.getByRole('button', { name: '恢复文章', exact: true })).toBeVisible()
  await expect(row.getByRole('button', { name: '永久删除', exact: true })).toHaveClass(/text-error/)
  await page.screenshot({ path: testInfo.outputPath('recycle-bin.png'), fullPage: true })
  await row.getByRole('button', { name: '永久删除', exact: true }).click()
  await expect(dialog).toContainText(title)
  await expect(dialog).toContainText('无法恢复')
  await dialog.getByRole('button', { name: '取消', exact: true }).click()
  await expect(dialog).toHaveCount(0)
  await expect(row).toHaveCount(1)
  expect((await (await page.request.get(endpoint)).json()).draft.markdown).toContain('需要彻底删除的正文')
  await row.getByRole('button', { name: '永久删除', exact: true }).click()
  await page.screenshot({ path: testInfo.outputPath('permanent-delete-confirmation.png'), fullPage: true })
  await dialog.getByRole('button', { name: '永久删除', exact: true }).click()
  await expect(row).toHaveCount(0)
  await expect(page.getByRole('status').filter({ hasText: '文章已永久删除' })).toBeVisible()
  expect((await page.request.get(endpoint)).status()).toBe(404)
  expect((await page.request.get(`${endpoint}/history`)).status()).toBe(404)
  await page.reload()
  await page.getByRole('tab', { name: /^回收站/ }).click()
  await page.getByRole('searchbox', { name: '搜索文章' }).fill(title)
  await expect(row).toHaveCount(0)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth),
  ).toBe(true)
})

test('article pagination changes the visible rows and resets when filtering', async ({ page }) => {
  await login(page)
  const headers = { 'x-admin-request': '1', origin: new URL(page.url()).origin }
  const prefix = `page-check-${test.info().project.name}-${Date.now()}`
  for (let index = 0; index < 11; index++) {
    const response = await page.request.post('/api/admin/articles', {
      headers,
      data: {
        title: `${prefix} ${index}`,
        slug: `${prefix}-${index}`,
        description: '',
        markdown: '',
        tags: [],
        category: '随想',
        cover: '',
        date: '2026-10-07',
        featured: false,
      },
    })
    expect(response.ok()).toBe(true)
  }
  await page.reload()
  await page.getByRole('searchbox', { name: '搜索文章' }).fill(prefix)
  await expect(page.locator('.admin-article-row')).toHaveCount(10)
  await expect(page.locator('.admin-stats-grid')).toHaveCount(0)
  const pagination = page.getByRole('navigation', { name: '文章分页' })
  await pagination.getByRole('button', { name: '下一页', exact: true }).click()
  await expect(page.locator('.admin-article-row')).toHaveCount(1)
  await page.getByRole('tab', { name: /^已发布/ }).click()
  await expect(page.locator('.admin-article-row')).toHaveCount(0)
  await expect(pagination.getByRole('button', { name: '上一页', exact: true })).toBeDisabled()
})

test('menu and sorting animate while note counters keep a stable height', async ({ page, isMobile }) => {
  await login(page)
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  await page.evaluate(() => {
    const observed = { page: false, sort: false }
    Object.assign(window, { observedAdminMotion: observed })
    new MutationObserver((changes) => {
      for (const change of changes) {
        if (!(change.target instanceof Element)) continue
        if (change.target.classList.contains('admin-page-enter-active')) observed.page = true
        if (change.target.classList.contains('admin-sort-move')) observed.sort = true
      }
    }).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] })
  })
  await openNavigation(page)
  await page.getByRole('link', { name: '首页', exact: true }).click()
  await expect(page.getByRole('heading', { name: '首页', exact: true })).toBeVisible()
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { observedAdminMotion: { page: boolean } }).observedAdminMotion.page,
      ),
    )
    .toBe(true)
  const note = page.locator('.admin-thought-card').first()
  await expect(note.locator('.v-counter')).toBeVisible()
  const before = await note.boundingBox()
  await note.getByRole('textbox').focus()
  await expect(note.locator('.v-counter')).toBeVisible()
  const focused = await note.boundingBox()
  expect(focused!.height).toBeCloseTo(before!.height, 1)
  await page.getByRole('heading', { name: '便签话术 6' }).click()
  expect((await note.boundingBox())!.height).toBeCloseTo(before!.height, 1)
  await expect(page.locator('.admin-home-photo-fields')).not.toContainText(['为无法看到图片的访客描述画面。'])
  const caption = await page
    .locator('.admin-home-photo')
    .nth(0)
    .getByRole('textbox', { name: '配文', exact: true })
    .inputValue()
  await page.getByRole('button', { name: '下移第 1 张照片', exact: true }).click()
  await expect(
    page.locator('.admin-home-photo').nth(1).getByRole('textbox', { name: '配文', exact: true }),
  ).toHaveValue(caption)
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { observedAdminMotion: { sort: boolean } }).observedAdminMotion.sort,
      ),
    )
    .toBe(true)
  if (!isMobile) {
    await page
      .getByRole('button', { name: '拖动第 2 张照片排序', exact: true })
      .dragTo(page.locator('.admin-home-photo').first())
    await expect(
      page.locator('.admin-home-photo').nth(0).getByRole('textbox', { name: '配文', exact: true }),
    ).toHaveValue(caption)
  }
  await openNavigation(page)
  await page.getByRole('link', { name: '图片', exact: true }).click()
  const confirmation = page.getByRole('dialog')
  if (await confirmation.isVisible())
    await confirmation.getByRole('button', { name: '放弃修改并离开' }).click()
  await expect(page).toHaveURL('/admin/media')
})

test('rich text pastes Markdown, preserves MDC, inserts media and saves only on demand', async ({
  page,
}, testInfo) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await login(page)
  await page.getByRole('button', { name: '新建文章' }).click()
  await expect(page.getByRole('textbox', { name: '文章正文' })).toBeVisible()
  const endpoint = `/api/admin/articles/${page.url().split('/').at(-1)}`
  const original = await (await page.request.get(endpoint)).json()
  const requests: string[] = []
  page.on('request', (request) => {
    if (request.method() === 'PUT' || new URL(request.url()).pathname === '/api/admin/preview')
      requests.push(request.url())
  })
  const callout = '::content-callout{title="保留原有提示块"}\n提示块里的 **文字**。\n::'
  const markdown = `## 粘贴 Markdown\n\n这是 **加粗** 和 [链接](https://example.com)。\n\n- 项目一\n- 项目二\n\n- [x] 已完成\n\n| 名称 | 值 |\n| --- | --- |\n| 答案 | 42 |\n\n\`\`\`ts\nconst answer = 42\n\`\`\`\n\n${callout}`
  await pasteMarkdown(page, markdown)
  const body = page.getByRole('textbox', { name: '文章正文' })
  await expect(body.getByRole('heading', { name: '粘贴 Markdown' })).toBeVisible()
  await expect(body.locator('strong').first()).toHaveText('加粗')
  await expect(body.getByRole('link', { name: '链接' })).toHaveAttribute('href', 'https://example.com')
  await expect(body.getByRole('listitem').filter({ hasText: '项目一' })).toBeVisible()
  await expect(body.getByRole('cell', { name: '42', exact: true })).toBeVisible()
  await expect(body.locator('.vditor-wysiwyg__preview .language-ts')).toContainText('const answer = 42')
  await expect(page.locator('.admin-save-status')).toContainText('待保存')
  await page.waitForTimeout(1600)
  expect(requests).toHaveLength(0)
  expect((await (await page.request.get(endpoint)).json()).draft.markdown).toBe(original.draft.markdown)
  expect(
    await page.evaluate(() => Object.keys(localStorage).filter((key) => key.startsWith('vditor'))),
  ).toEqual([])

  // Add text with the plugin's bold command.
  await body.locator('h2').click()
  await page.keyboard.press('End')
  await page.keyboard.press('Enter')
  await page.locator('.vditor-toolbar button[data-type="bold"]').click()
  await page.keyboard.type('工具栏加粗')
  await expect(body.locator('strong').filter({ hasText: '工具栏加粗' })).toBeVisible()

  // Place the cursor after the first paragraph and keep that position through the picker dialog.
  await body.locator('p').filter({ hasText: '这是' }).first().click()
  await page.keyboard.press('End')
  await page.getByRole('button', { name: '插入图片', exact: true }).click()
  const chosen = page.getByRole('dialog').locator('.admin-media-image').first()
  const src = await chosen.locator('img').getAttribute('src')
  await chosen.click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(body.locator(`img[src="${src}"]`)).toBeVisible()
  await page.getByLabel('标题', { exact: true }).fill('Markdown 富文本兼容性')
  await body.locator('h2').click()
  await page.keyboard.press('End')
  await page.keyboard.type('（即时保存）')
  await page.keyboard.press('ControlOrMeta+s')
  await expect(page.locator('.admin-save-status')).toContainText('已保存')
  expect(requests).toHaveLength(1)
  const saved = await (await page.request.get(endpoint)).json()
  expect(saved.draft.markdown).toContain('## 粘贴 Markdown（即时保存）')
  expect(saved.draft.markdown).toContain('**工具栏加粗**')
  expect(saved.draft.markdown).toContain('const answer = 42')
  expect(saved.draft.markdown).toContain(callout)
  expect(saved.draft.markdown).not.toContain('xiaotong-mdc')
  expect(saved.draft.markdown).toContain(`![图片描述](${src})`)
  expect(saved.draft.markdown.indexOf(`![图片描述](${src})`)).toBeLessThan(
    saved.draft.markdown.indexOf('项目一'),
  )
  await page.reload()
  await expect(
    page.getByRole('textbox', { name: '文章正文' }).getByRole('heading', { name: '粘贴 Markdown' }),
  ).toBeVisible()
  await expect(page.locator('.admin-save-status')).toContainText('已保存')
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(page.locator('.admin-rich-editor .vditor')).toHaveClass(/vditor--dark/)
  await expect(page.getByRole('textbox', { name: '文章正文' })).toHaveCSS(
    'background-color',
    'rgb(39, 43, 40)',
  )
  await page.screenshot({ path: testInfo.outputPath('rich-editor-dark.png'), fullPage: true })
  await page.getByRole('button', { name: '预览', exact: true }).click()
  await expect(page.frameLocator('.admin-preview-frame').locator('.content-callout')).toContainText(
    '保留原有提示块',
  )
  await expect(
    page.frameLocator('.admin-preview-frame').getByRole('cell', { name: '42', exact: true }),
  ).toBeVisible()
  expect(requests).toHaveLength(2)
  expect(errors).toEqual([])
})
