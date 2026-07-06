import { expect, test } from '@playwright/test'

test('stage 1 renders the PDP from one big client component', async ({ page }) => {
  await page.goto('/journey/stage-1/products/aurora-desk-lamp')
  await expect(page.getByTestId('stage-banner')).toBeVisible()
  await expect(page.getByTestId('stage1-pdp')).toBeVisible()
  // Data arrives via client-side React Query fetches.
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('xray-toggle')).toBeVisible()
})
