import { expect, test } from '@playwright/test'

test('x-ray panel lists streamed server sections with timings', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=50&delay_inventory=50&delay_reviews=50'
  )
  await page.getByTestId('xray-toggle').click()
  await expect(page.getByTestId('xray-panel')).toBeVisible()
  await expect(page.getByTestId('xray-panel')).toContainText('PricingPanel')
  await expect(page.getByTestId('xray-panel')).toContainText('ReviewsSection')
  await expect(page.getByTestId('xray-panel')).toContainText('server')
})

test('x-ray records client islands', async ({ page }) => {
  await page.goto('/store')
  await page.getByTestId('xray-toggle').click()
  await expect(page.getByTestId('xray-panel')).toContainText('ProductGrid')
  await expect(page.getByTestId('xray-panel')).toContainText('client')
})
