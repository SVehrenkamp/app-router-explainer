import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3111' },
  webServer: {
    command: 'npm run dev -- --port 3111',
    url: 'http://localhost:3111',
    env: { SERVICES_BASE_URL: 'http://localhost:3111' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
