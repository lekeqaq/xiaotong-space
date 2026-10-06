import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { scryptSync } from 'node:crypto'
import { defineConfig } from '@playwright/test'

const adminDir = (process.env.XIAOTONG_TEST_ADMIN_DIR ||= mkdtempSync(resolve(tmpdir(), 'xiaotong-browser-')))
const salt = 'b'.repeat(32)

export default defineConfig({
  globalTeardown: './tests/e2e/cleanup.mjs',
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
    { name: 'desktop', testMatch: /site\.spec\.ts/, use: { viewport: { width: 1280, height: 900 } } },
    {
      name: 'mobile',
      testMatch: /site\.spec\.ts/,
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'admin-desktop',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['desktop', 'mobile'],
      use: { viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'admin-mobile',
      testMatch: /admin\.spec\.ts/,
      dependencies: ['desktop', 'mobile'],
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
  ],
  webServer: {
    command: 'node .output/server/index.mjs',
    env: {
      PORT: '3200',
      HOST: '127.0.0.1',
      NUXT_PUBLIC_SITE_URL: '',
      NUXT_ADMIN_DATA_DIR: adminDir,
      NUXT_ADMIN_USERNAME: 'admin',
      NUXT_ADMIN_PASSWORD_HASH: `scrypt:${salt}:${scryptSync('browser-test-password-only', salt, 64).toString('hex')}`,
    },
    url: 'http://127.0.0.1:3200',
    reuseExistingServer: false,
  },
})
