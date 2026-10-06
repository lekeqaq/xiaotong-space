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

test('login, article autosave, preview and publication work on desktop and mobile', async ({
  page,
  isMobile,
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
  await page
    .getByLabel('文章正文', { exact: true })
    .fill('## 浏览器中的思考\n\n这是尚未发布的内容。\n\n```ts\nconst answer = 42\n```')
  await page.getByRole('button', { name: '选择文章封面' }).click()
  await page.locator('input[type="file"]').setInputFiles('public/images/personal/notebook.jpg')
  await expect(page.getByRole('dialog')).toHaveCount(0, { timeout: 10_000 })
  const uploadedSrc = await page.locator('.admin-cover-picker img').getAttribute('src')
  await page
    .getByLabel('文章正文', { exact: true })
    .fill(
      `## 浏览器中的思考\n\n这是尚未发布的内容。\n\n![上传插图](${uploadedSrc})\n\n\`\`\`ts\nconst answer = 42\n\`\`\``,
    )
  await expect(page.locator('.admin-save-status')).toContainText('已保存', { timeout: 10_000 })
  const publicDraft = await page.request.get(`/writing/${slug}`)
  expect(publicDraft.status()).toBe(404)
  if (isMobile)
    await page.locator('.admin-mobile-editor-tabs').getByRole('tab', { name: '预览', exact: true }).click()
  await expect(page.locator('.admin-inline-preview')).toContainText('浏览器中的思考', { timeout: 15_000 })
  await expect(page.locator('.admin-inline-preview .code-block pre code .line span').first()).toBeVisible()
  await page.locator('.admin-editor-heading h1').click()
  await page.screenshot({ path: testInfo.outputPath('article-editor.png'), fullPage: true })
  await page.locator('.admin-editor-actions').getByRole('button', { name: '预览', exact: true }).click()
  await expect(
    page.frameLocator('.admin-preview-frame').getByRole('heading', { name: '浏览器编辑验证', exact: true }),
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
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(21, 23, 33)')
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
  await expect(page.locator('.admin-login-card')).toHaveCSS('background-color', 'rgb(31, 34, 48)')
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
  await expect(page.locator('.v-application')).toHaveCSS('background-color', 'rgb(21, 23, 33)')
  await page.screenshot({ path: testInfo.outputPath('home-photo-cards-dark.png'), fullPage: true })
  await page.evaluate(() =>
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true }),
  )
  await page.getByRole('button', { name: '切换到浅色主题' }).click()
  await expect(page.locator('html')).toHaveClass(/theme-fading/)
  await expect(page.locator('html')).not.toHaveClass(/theme-fading/)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})
