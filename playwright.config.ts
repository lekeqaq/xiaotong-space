import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : 4,
  reporter: process.env.CI ? 'github' : 'list',
  outputDir: 'artifacts/playwright',
  use: {
    baseURL: 'http://127.0.0.1:3200',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    env: { PORT: '3200', HOST: '127.0.0.1' },
    url: 'http://127.0.0.1:3200',
    reuseExistingServer: false,
  },
})
