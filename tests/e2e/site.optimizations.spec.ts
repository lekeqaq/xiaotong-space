import { test, expect } from '@playwright/test'

async function openWriting(page: import('@playwright/test').Page) {
  await page.goto('/about')
  await page
    .locator('.profile-links')
    .getByRole('link', { name: /读读笔记/ })
    .click()
}

async function navigateClient(page: import('@playwright/test').Page, path: string) {
  await page.evaluate((to) => {
    const root = document.querySelector('#__nuxt') as HTMLElement & {
      __vue_app__: { config: { globalProperties: { $router: { push: (path: string) => Promise<unknown> } } } }
    }
    return root.__vue_app__.config.globalProperties.$router.push(to)
  }, path)
}

test('article list failures can be retried and differ from an empty library', async ({ page }) => {
  await page.route('**/api/content/articles', (route) =>
    route.fulfill({ status: 503, json: { statusCode: 503 } }),
  )
  await openWriting(page)
  await expect(page.getByRole('heading', { name: '笔记暂时没加载出来' })).toBeVisible()
  await expect(page.getByText('共 0 篇笔记')).toHaveCount(0)
  await page.unrouteAll()
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.writing-entry')).toHaveCount(3)
  await page.route('**/api/content/articles', (route) => route.fulfill({ json: [] }))
  await openWriting(page)
  await expect(page.getByRole('heading', { name: '还没有发布笔记。' })).toBeVisible()
  await expect(page.getByRole('button', { name: '重新加载' })).toHaveCount(0)
})

test('article details recover from failure and use a distinct 404 state', async ({ page }) => {
  await page.goto('/writing')
  await page.route('**/api/content/articles/*', (route) =>
    route.fulfill({ status: 503, json: { statusCode: 503 } }),
  )
  await page.locator('.writing-entry').first().click()
  await expect(page.getByRole('heading', { name: '这篇笔记暂时没加载出来' })).toBeVisible()
  await page.unrouteAll()
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.prose-content')).toContainText('先整理知识，再开始问答')
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article')
  const response = await page.goto('/writing/missing')
  expect(response?.status()).toBe(404)
  await expect(page.getByRole('heading', { name: 'A little off the path.' })).toBeVisible()
  await expect(page.getByRole('link', { name: '返回笔记列表' })).toBeVisible()
})

test('a stalled article list times out into a recoverable state', async ({ page }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/content/articles', async (route) => {
    await pending
    await route.continue().catch(() => {})
  })
  try {
    await openWriting(page)
    await expect(page.getByRole('heading', { name: '笔记暂时没加载出来' })).toBeVisible({ timeout: 12000 })
  } finally {
    release()
  }
  await page.unrouteAll({ behavior: 'wait' })
  await page.getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.writing-entry')).toHaveCount(3)
})

test('navigation failure leaves the article readable', async ({ page }) => {
  await page.route('**/api/content/articles', (route) =>
    route.fulfill({ status: 503, json: { statusCode: 503 } }),
  )
  await page.goto('/projects')
  // Client navigation makes the injected API fault visible; SSR requests bypass page.route.
  await page.locator('.project-next').getByRole('link').click()
  await expect(page.getByRole('heading', { name: '笔记暂时没加载出来' })).toBeVisible()
  await navigateClient(page, '/writing/building-personal-ai')
  await expect(page.locator('.prose-content')).toContainText('先整理知识，再开始问答')
  await expect(page.getByRole('navigation', { name: '文章翻页' })).toHaveCount(0)
})

test('home sections recover independently', async ({ page }) => {
  await page.route('**/api/content/articles', (route) =>
    route.fulfill({ status: 503, json: { statusCode: 503 } }),
  )
  await page.route('**/api/content/projects', (route) =>
    route.fulfill({ status: 503, json: { statusCode: 503 } }),
  )
  await page.goto('/about')
  await page.locator('.app-header .wordmark').click()
  await expect(page.getByRole('heading', { name: '笔记暂时没加载出来' })).toBeVisible()
  await expect(page.getByRole('heading', { name: '作品暂时没加载出来' })).toBeVisible()
  await expect(page.getByRole('button', { name: '翻看下一张生活照片' })).toBeVisible()
  await page.unroute('**/api/content/projects')
  await page.locator('.work-shelf').getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.shelf-item')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: '笔记暂时没加载出来' })).toBeVisible()
  await page.unrouteAll()
  await page.locator('.notebook-feed').getByRole('button', { name: '重新加载' }).click()
  await expect(page.locator('.notebook-entry')).toHaveCount(3)
})

test('narrow screens retain readable cards and long category labels', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 })
  await page.goto('/')
  const sizes = await page
    .locator('.desk-note p,.desk-note-meta,.postcard-caption,.building-caption')
    .evaluateAll((elements) => elements.map((el) => Number.parseFloat(getComputedStyle(el).fontSize)))
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12)
  await page.route('**/api/content/articles', async (route) => {
    const response = await route.fetch()
    const articles = await response.json()
    articles[0].category = 'Engineering with a much longer category label'
    await route.fulfill({ json: articles })
  })
  await page.locator('.space-dock').getByRole('link', { name: '笔记' }).click()
  await expect(page.getByRole('button', { name: /Engineering with/ })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320)
})

test('public pages do not load management assets and static thumbnails load one scene', async ({ page }) => {
  const assets: string[] = []
  page.on('request', (request) => assets.push(request.url()))
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  expect(
    assets.filter((url) => /AdminProvider|AdminDialog|VList|useAdminApi|vditor|vuetify/i.test(url)),
  ).toEqual([])
  await expect(page.locator('.shelf-travel .study-landscape-window img')).toHaveCount(1)
  const html = await page.content()
  expect(html).not.toContain('.admin{--admin-muted')
  await page.goto('/about')
  await expect(page.locator('.finder-window img')).toHaveCount(1)
  await page.getByRole('button', { name: /海岸/ }).click()
  await expect(page.locator('.finder-window img')).toHaveCount(2)
})

test('image failures use the default illustration and keep the card usable', async ({ page }) => {
  await page.route('**/_ipx/**/images/personal/coast.jpg', (route) =>
    route.fulfill({ status: 404, body: '' }),
  )
  await page.goto('/')
  const image = page.locator('.desk-postcard img')
  await image.scrollIntoViewIfNeeded()
  await expect(image).toHaveAttribute('src', '/og/default.png')
  await page.getByRole('button', { name: '翻看下一张生活照片' }).click()
  await expect(image).not.toHaveAttribute('src', '/og/default.png')
})

test('a client visit can enter the management login after public navigation', async ({ page }) => {
  await page.goto('/')
  await navigateClient(page, '/admin/login')
  await expect(page.getByLabel('账号', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: '登录后台' })).toBeVisible()
})

test('code comments retain sufficient contrast in both reading themes', async ({ page }) => {
  await page.goto('/writing/building-personal-ai')
  for (const theme of ['light', 'dark']) {
    if (theme === 'dark') await page.getByRole('button', { name: '切换到深色主题' }).click()
    await expect(page.locator('html')).toHaveClass(new RegExp(theme))
    const ratios = await page.locator('pre code .line span').evaluateAll((tokens) => {
      const luminance = (color: string) => {
        const channels = color
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map((value) => {
            const channel = Number(value) / 255
            return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
          })
        return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722
      }
      return tokens
        .filter((token) => token.textContent?.trim().startsWith('//'))
        .map((token) => {
          const foreground = luminance(getComputedStyle(token).color)
          const background = luminance(getComputedStyle(token.closest('.code-block')!).backgroundColor)
          return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05)
        })
    })
    expect(ratios.length).toBeGreaterThan(0)
    expect(Math.min(...ratios)).toBeGreaterThanOrEqual(4.5)
  }
})
