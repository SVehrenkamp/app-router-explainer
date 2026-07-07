import { expect, test } from '@playwright/test'

test('legacy PDP server-renders product, pricing, and inventory together', async ({ page }) => {
  await page.goto('/legacy/products/aurora-desk-lamp')
  await expect(page.getByTestId('legacy-pdp')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('legacy-price')).toBeVisible()
})

test('legacy PDP loads reviews client-side after hydration', async ({ page }) => {
  await page.goto('/legacy/products/aurora-desk-lamp')
  await expect(page.getByTestId('legacy-reviews')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('legacy-reviews').locator('blockquote').first()).toBeVisible()
})

test('legacy PDP 404s politely on unknown slugs', async ({ page }) => {
  await page.goto('/legacy/products/nope')
  await expect(page.getByText('Product not found')).toBeVisible()
})

test('legacy search reads ?q= via getInitialProps and full-reloads on submit', async ({ page }) => {
  await page.goto('/legacy/search?q=lamp')
  await expect(page.getByTestId('legacy-search-results')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()

  await page.getByTestId('legacy-search-input').fill('mug')
  await page.getByTestId('legacy-search-submit').click()
  await page.waitForURL(/q=mug/)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()
})
