import { expect, test } from '@playwright/test'

test('labs index lists the three labs', async ({ page }) => {
  await page.goto('/labs')
  await expect(page.getByTestId('lab-card')).toHaveCount(3)
  for (const title of ['Boundary Explorer', 'Cache Lab', 'RSC Payload Inspector']) {
    await expect(page.getByTestId('lab-card').filter({ hasText: title })).toBeVisible()
  }
})
