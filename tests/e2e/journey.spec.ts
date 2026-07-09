import { expect, test } from '@playwright/test'

test('stage 1 renders the PDP from one big client component', async ({ page }) => {
  await page.goto('/journey/stage-1/products/aurora-desk-lamp')
  await expect(page.getByTestId('stage-banner')).toBeVisible()
  await expect(page.getByTestId('stage1-pdp')).toBeVisible()
  // Data arrives via client-side React Query fetches.
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('xray-toggle')).toBeVisible()
})

test('stage 2 server-renders the shell and hydrates reviews without a client fetch', async ({ page }) => {
  // Block the reviews service in the BROWSER: if reviews still render, they
  // came from the server prefetch through the HydrationBoundary.
  await page.route('**/api/services/reviews/**', (route) => route.abort())
  await page.goto('/journey/stage-2/products/aurora-desk-lamp')
  await expect(page.getByTestId('stage2-pdp')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('s2-reviews')).toBeVisible()
  // Pricing island fetches client-side and still works.
  await expect(page.getByTestId('s2-pricing-island')).toContainText('$', { timeout: 15_000 })
})

test('stage 3 streams sections server-first with a single cart island', async ({ page }) => {
  // waitUntil: 'commit' — with streaming SSR, 'load' resolves only after the
  // full stream (delayed reviews included), making the skeleton unobservable.
  await page.goto(
    '/journey/stage-3/products/aurora-desk-lamp?delay_products=0&delay_pricing=100&delay_inventory=100&delay_reviews=3000',
    { waitUntil: 'commit' }
  )
  await expect(page.getByTestId('stage-banner')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  // Reviews are artificially slowed: the skeleton shows first, the section streams in later.
  await expect(page.getByTestId('reviews-skeleton')).toBeVisible({ timeout: 2_000 })
  await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 25_000 })
  await expect(page.getByTestId('add-to-cart')).toBeVisible()
})

test('journey dashboard lists all four stages with measured bundle sizes', async ({ page }) => {
  await page.goto('/journey')
  await expect(page.getByTestId('stage-card')).toHaveCount(4)
  await expect(page.getByTestId('metrics-table')).toBeVisible()
  await expect(page.getByTestId('metrics-table')).toContainText('KB')
  await expect(page.getByTestId('stage-card').filter({ hasText: 'Stage 3' })).toBeVisible()
})

test('journey stages have linear prev/next navigation preserving the product', async ({ page }) => {
  await page.goto('/journey/stage-1/products/aurora-desk-lamp')
  await page.getByTestId('stage-nav-next').click()
  await expect(page).toHaveURL(/stage-2\/products\/aurora-desk-lamp/)
  await expect(page.getByTestId('stage-nav-prev')).toBeVisible()
  // Stage 0 lives in the Pages Router — its advance affordance is in the legacy chrome.
  await page.goto('/legacy/products/aurora-desk-lamp')
  await page.getByTestId('legacy-advance').click()
  await expect(page).toHaveURL(/stage-1\/products\/aurora-desk-lamp/)
})
