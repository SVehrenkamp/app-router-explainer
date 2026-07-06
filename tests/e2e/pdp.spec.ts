import { expect, test } from '@playwright/test'

test('PDP streams: product info is visible while reviews are still loading', async ({
  page,
}) => {
  // waitUntil: 'commit' returns as soon as the response starts streaming —
  // the default 'load' would only resolve AFTER the full stream finishes,
  // making the skeleton unobservable.
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_products=0&delay_pricing=100&delay_inventory=100&delay_reviews=3000',
    { waitUntil: 'commit' }
  )
  // Shell content arrived...
  await expect(page.getByRole('heading', { name: 'Aurora Desk Lamp' })).toBeVisible()
  // ...while the slowest section is still a skeleton...
  await expect(page.getByTestId('reviews-skeleton')).toBeVisible({ timeout: 2_000 })
  // ...and later resolves without a navigation.
  await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByTestId('reviews-skeleton')).toHaveCount(0)
})

test('PDP renders pricing and inventory from their services', async ({ page }) => {
  await page.goto('/store/products/cascade-water-bottle?delay_pricing=0&delay_inventory=0&delay_reviews=0')
  await expect(page.getByTestId('pricing-panel')).toBeVisible()
  await expect(page.getByTestId('inventory-badge')).toBeVisible()
})

test('unknown product renders the not-found UI', async ({ page }) => {
  // With an ancestor loading.tsx the shell (status 200) flushes before the
  // page resolves, so notFound() cannot change the HTTP status — the 404 is
  // rendered into the stream instead. (SEO implications: curriculum module 10.)
  await page.goto('/store/products/does-not-exist?delay_products=0')
  await expect(page.getByText(/could not be found|Page not found/i)).toBeVisible()
  await expect(page.getByTestId('pricing-panel')).toHaveCount(0)
})

test('PLP card navigates to the PDP', async ({ page }) => {
  await page.goto('/store')
  await page.getByTestId('product-card').first().click()
  await expect(page.getByTestId('pricing-panel')).toBeVisible({ timeout: 10_000 })
})
