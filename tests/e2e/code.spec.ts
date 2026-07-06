import { expect, test } from '@playwright/test'

test('show-me-the-code opens highlighted PDP source', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=0&delay_inventory=0&delay_reviews=0'
  )
  await page.getByTestId('code-button-store-pdp').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Suspense')
})

test('unknown source id returns 404', async ({ page }) => {
  const res = await page.request.get('/api/source/etc-passwd')
  expect(res.status()).toBe(404)
})
