import { expect, test } from '@playwright/test'

test('PLP renders the first page of products', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByTestId('product-card')).toHaveCount(6)
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
})

test('storefront layout links to search and cart', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByRole('link', { name: 'Search' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Cart/ })).toBeVisible()
})
