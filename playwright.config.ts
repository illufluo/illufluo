import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: process.env.CI ? 2 : 3,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4323',
    trace: 'retain-on-failure',
    // 本机有 Chrome 时复用；CI 使用 Playwright Chromium。
    channel: existsSync('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome') ? 'chrome' : undefined,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    { command: 'node scripts/serve-build.mjs dist 4322', url: 'http://127.0.0.1:4322', reuseExistingServer: false },
    { command: 'node scripts/serve-build.mjs dist-demo 4323', url: 'http://127.0.0.1:4323', reuseExistingServer: false },
  ],
});
