import { expect, test } from '@playwright/test'

test('a failing reviews service is contained by its section boundary', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=0&delay_inventory=0&delay_reviews=0&fail_reviews=1'
  )
  await expect(page.getByTestId('reviews-error')).toBeVisible()
  // The failure did NOT take down the rest of the page:
  await expect(page.getByTestId('pricing-panel')).toBeVisible()
  await expect(page.getByTestId('add-to-cart')).toBeVisible()
})

test('unknown product renders the custom 404 page', async ({ page }) => {
  await page.goto('/store/products/does-not-exist?delay_products=0')
  await expect(page.getByText('Page not found')).toBeVisible()
})
