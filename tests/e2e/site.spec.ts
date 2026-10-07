import { test, expect } from '@playwright/test'
import type { Locator } from '@playwright/test'

const routes = [
  '/',
  '/projects',
  '/writing',
  '/about',
  '/projects/weekend',
  '/projects/digital-human',
  '/writing/building-personal-ai',
  '/writing/voice-agent-notes',
  '/writing/webrtc-notes',
]

for (const route of routes) {
  test(`${route} stays readable within the viewport`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    await page.goto(route)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByRole('main')).toBeVisible()
    await expect(page.getByRole('button', { name: '切换到深色主题' })).toBeVisible()
    const dimensions = await page.evaluate(() => ({
      content: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }))
    expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1)
    expect(errors).toEqual([])
    // Keep a few representative renders for visual review after CSS changes.
    if (['/', '/projects', '/about', '/writing/building-personal-ai'].includes(route)) {
      await page.screenshot({ path: testInfo.outputPath('page.png'), fullPage: true })
    }
  })
}

test('search, category filters and reset work together', async ({ page }) => {
  await page.goto('/writing')
  const entries = page.locator('.writing-entry')
  const search = page.getByRole('searchbox', { name: '搜索文章' })
  await expect(entries).toHaveCount(3)
  await search.fill('  rAg  ')
  await expect(entries).toHaveCount(1)
  await expect(entries).toContainText('个人 AI 助手的知识库设计思路')
  await page.getByRole('button', { name: /^Frontend/ }).click()
  await expect(entries).toHaveCount(0)
  await expect(page.getByRole('heading', { name: '这一页，暂时还是空白。' })).toBeVisible()
  await page.getByRole('button', { name: '重置筛选' }).click()
  await expect(entries).toHaveCount(3)
  await expect(search).toHaveValue('')
  await page.getByRole('button', { name: /^Engineering/ }).click()
  await expect(entries).toHaveCount(1)
  await expect(entries).toContainText('WebRTC')
})

test('Escape clears search and preserves keyboard focus', async ({ page }) => {
  await page.goto('/writing')
  const search = page.getByRole('searchbox', { name: '搜索文章' })
  await search.fill('没有这篇笔记')
  await expect(page.locator('.writing-entry')).toHaveCount(0)
  await search.press('Escape')
  await expect(search).toHaveValue('')
  await expect(search).toBeFocused()
  await expect(page.locator('.writing-entry')).toHaveCount(3)
})

test('navigation opens Writing and closes the mobile menu', async ({ page, isMobile }) => {
  await page.goto('/about')
  if (isMobile) {
    const menu = page.getByRole('button', { name: '打开导航菜单' })
    await menu.press('Enter')
    const navigation = page.getByRole('navigation', { name: '移动端导航' })
    await expect(navigation).toBeVisible()
    await navigation.getByRole('link', { name: 'Writing', exact: true }).click()
    await expect(page).toHaveURL('/writing')
    await expect(navigation).toBeHidden()
    await menu.press('Enter')
    await expect(navigation.getByRole('link', { name: 'Writing', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
    await menu.press('Enter')
    await expect(navigation).toBeHidden()
  } else {
    const navigation = page.getByRole('navigation', { name: '主要导航' })
    await navigation.getByRole('link', { name: 'Writing', exact: true }).click()
    await expect(page).toHaveURL('/writing')
    await expect(navigation.getByRole('link', { name: 'Writing', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    )
  }
})

test('first Projects navigation reuses home data without a browser database', async ({ page, isMobile }) => {
  const coldRequests: string[] = []
  page.on('request', (request) => {
    if (/\.wasm(?:\?|$)|sql_dump|\/api\/content\/projects(?:\?|$)/.test(request.url())) {
      coldRequests.push(request.url())
    }
  })
  await page.goto('/')
  // A new context has no browser database, route or HTTP cache.
  if (isMobile) await page.getByRole('button', { name: '打开导航菜单' }).click()
  const navigation = page.getByRole('navigation', { name: isMobile ? '移动端导航' : '主要导航' })
  await navigation.getByRole('link', { name: 'Projects', exact: true }).click()
  await expect(page).toHaveURL('/projects')
  await expect(page.locator('.project-showcase')).toHaveCount(2)
  await expect(page.locator('.project-showcase').first()).toBeVisible()
  const title = await page.locator('.project-showcase h2').first().innerText()
  await page.locator('.showcase-link').first().click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText(title)
  await page.locator('.back-link').click()
  await expect(page.locator('.project-showcase')).toHaveCount(2)
  expect(coldRequests).toEqual([])
})

test('slow navigation gives feedback and clears it after rendering', async ({ page, isMobile }) => {
  let release!: () => void
  const pending = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route('**/api/content/articles', async (route) => {
    await pending
    await route.continue()
  })
  await page.goto('/about')
  if (isMobile) await page.getByRole('button', { name: '打开导航菜单' }).click()
  const navigation = page.getByRole('navigation', { name: isMobile ? '移动端导航' : '主要导航' })
  try {
    await navigation.getByRole('link', { name: 'Writing', exact: true }).click()
    await expect(page.getByRole('status').filter({ hasText: '正在加载页面' })).toBeVisible()
    await expect(page.locator('.nuxt-loading-indicator')).toHaveCSS('opacity', '1')
  } finally {
    release()
  }
  await expect(page.locator('.writing-entry')).toHaveCount(3)
  await expect(page.getByRole('status').filter({ hasText: '正在加载页面' })).toHaveCount(0)
})

test('theme preference survives navigation and reload', async ({ page }, testInfo) => {
  await page.goto('/about')
  const root = page.locator('html')
  await page.getByRole('button', { name: '切换到深色主题' }).click()
  await expect(root).toHaveClass(/dark/)
  await page.goto('/writing')
  await expect(root).toHaveClass(/dark/)
  await page.goto('/projects')
  await expect(root).toHaveClass(/dark/)
  await page.screenshot({ path: testInfo.outputPath('dark-projects.png'), fullPage: true })
  await page.reload()
  await expect(root).toHaveClass(/dark/)
  await page.getByRole('button', { name: '切换到浅色主题' }).click()
  await expect(root).not.toHaveClass(/dark/)
})

test('digital human phases support keyboard input and announce the response', async ({ page, isMobile }) => {
  await page.goto('/projects/digital-human')
  if (isMobile) await page.getByRole('button', { name: '展开项目预览' }).click()
  const listening = page.getByRole('button', { name: /倾听/ })
  const thinking = page.getByRole('button', { name: /思考/ })
  const speaking = page.getByRole('button', { name: /回应/ })
  await expect(listening).toHaveAttribute('aria-pressed', 'true')
  await listening.focus()
  await listening.press('Tab')
  await expect(thinking).toBeFocused()
  await thinking.press('Enter')
  await expect(thinking).toHaveAttribute('aria-pressed', 'true')
  await expect(listening).toHaveAttribute('aria-pressed', 'false')
  await expect(page.locator('.companion-bottomline')).toContainText('Qwen / DeepSeek')
  await thinking.press('Tab')
  await expect(speaking).toBeFocused()
  await speaking.press('Space')
  await expect(speaking).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.companion-message.current')).toContainText('我在。慢慢说，今天怎么了？')
  await expect(page.locator('[aria-live="polite"]')).toContainText('回应：声伴')
  await expect(page.locator('.companion-bottomline')).toContainText('讯飞 TTS · LiveTalking')
})

test('project labels use readable type and keep controls inside the preview', async ({ page }) => {
  await page.goto('/projects')
  const sizes = await page
    .locator(
      '.companion-bottomline, .companion-message small, .companion-portrait figcaption, .study-bottomline, .showcase-caption',
    )
    .evaluateAll((elements) =>
      elements.map((element) => Number.parseFloat(getComputedStyle(element).fontSize)),
    )
  expect(sizes.length).toBeGreaterThan(0)
  expect(Math.min(...sizes)).toBeGreaterThanOrEqual(12)
  const coast = page.getByRole('button', { name: '海边放空' })
  await coast.click()
  await expect(coast).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByText('等一场海边日落。', { exact: true })).toBeVisible()
  await expect(page.getByRole('img', { name: '海边放空' })).toBeVisible()
  const overflows = await page
    .locator('.project-thumbnail')
    .evaluateAll((elements) => elements.map((element) => element.scrollWidth > element.clientWidth + 1))
  expect(overflows).not.toContain(true)
})

test.describe('front-end disclosure motion', () => {
  test.use({ reducedMotion: 'no-preference' })

  async function sampleTransition(disclosure: Locator) {
    return disclosure.evaluate(async (element) => {
      const panel = element.querySelector<HTMLElement>('.disclosure-panel')!
      element.querySelector<HTMLElement>('summary')!.click()
      for (let frame = 0; frame < 10; frame++) {
        const animation = panel.getAnimations()[0]
        if (animation) {
          animation.pause()
          animation.currentTime = Number(animation.effect!.getTiming().duration) / 2
          const sample = {
            height: panel.getBoundingClientRect().height,
            fullHeight: panel.firstElementChild!.getBoundingClientRect().height,
            opacity: Number(getComputedStyle(panel).opacity),
          }
          animation.play()
          return sample
        }
        await new Promise(requestAnimationFrame)
      }
      throw new Error('The disclosure changed without an animation')
    })
  }

  test('every public disclosure expands and collapses through intermediate frames', async ({
    page,
    isMobile,
  }) => {
    const screens = [
      {
        path: '/projects/weekend',
        selectors: isMobile
          ? ['.case-scene .animated-details', '.project-mobile-toc', '.mobile-menu']
          : ['.document-toc .animated-details'],
      },
      {
        path: '/writing/building-personal-ai',
        selectors: [isMobile ? '.article-mobile-toc' : '.document-toc .animated-details'],
      },
    ]
    for (const screen of screens) {
      await page.goto(screen.path)
      await page.waitForLoadState('networkidle')
      for (const selector of screen.selectors) {
        const disclosure = page.locator(selector)
        const initiallyOpen = (await disclosure.getAttribute('data-expanded')) === 'true'
        for (const open of [!initiallyOpen, initiallyOpen]) {
          const sample = await sampleTransition(disclosure)
          expect(sample.height).toBeGreaterThan(0)
          expect(sample.height).toBeLessThan(sample.fullHeight)
          expect(sample.opacity).toBeGreaterThan(0)
          expect(sample.opacity).toBeLessThan(1)
          await expect(disclosure.locator('summary')).toHaveAttribute('aria-expanded', String(open))
          const panel = disclosure.locator('.disclosure-panel')
          await expect.poll(() => panel.evaluate((element) => element.style.height)).toBe('')
          if (open) await expect(panel).toBeVisible()
          else await expect(panel).toBeHidden()
        }
      }
    }
  })

  test('rapid reversal, Escape and viewport changes leave a usable disclosure', async ({
    page,
    isMobile,
  }) => {
    await page.goto('/projects/weekend')
    await page.waitForLoadState('networkidle')
    const disclosure = page.locator(
      isMobile ? '.case-scene .animated-details' : '.document-toc .animated-details',
    )
    await sampleTransition(disclosure)
    await disclosure.evaluate((element) => {
      const summary = element.querySelector<HTMLElement>('summary')!
      for (let click = 0; click < 3; click++) summary.click()
    })
    const panel = disclosure.locator('.disclosure-panel')
    await expect.poll(() => panel.evaluate((element) => element.style.height)).toBe('')
    await expect(disclosure.locator('summary')).toHaveAttribute('aria-expanded', String(!isMobile))
    await disclosure.locator('summary').press('Enter')
    if (!isMobile) await disclosure.locator('summary').press('Enter')
    await disclosure.locator('summary').press('Escape')
    await expect(panel).toBeHidden()
    await expect(disclosure.locator('summary')).toBeFocused()
    if (isMobile) {
      await sampleTransition(disclosure)
      await page.setViewportSize({ width: 1280, height: 900 })
      await expect(panel).toBeVisible()
      await expect.poll(() => panel.evaluate((element) => element.style.height)).toBe('')
      await page.setViewportSize({ width: 390, height: 844 })
      await expect(panel).toBeHidden()
    }
  })
})

test('reduced motion keeps disclosure changes immediate', async ({ page, isMobile }) => {
  await page.goto('/projects/weekend')
  const disclosure = page.locator(isMobile ? '.project-mobile-toc' : '.document-toc .animated-details')
  await disclosure.locator('summary').press('Enter')
  const panel = disclosure.locator('.disclosure-panel')
  expect(await panel.evaluate((element) => element.getAnimations().length)).toBe(0)
  expect(await panel.evaluate((element) => element.style.height)).toBe('')
  if (isMobile) await expect(panel).toBeVisible()
  else await expect(panel).toBeHidden()
})
