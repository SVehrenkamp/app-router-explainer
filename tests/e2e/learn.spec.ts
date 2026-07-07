import { expect, test } from '@playwright/test'

test('a curriculum module renders through the MDX pipeline', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Why the App Router/i)
})
