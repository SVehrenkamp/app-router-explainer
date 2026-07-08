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

test('x-ray highlights server and client regions in place', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=0&delay_inventory=0&delay_reviews=0'
  )
  // Off by default: no region chrome.
  await expect(page.getByTestId('xray-region')).toHaveCount(0)
  await page.getByTestId('xray-toggle').click()
  // Regions appear around the real rendered sections, tagged by environment.
  expect(await page.getByTestId('xray-region').count()).toBeGreaterThanOrEqual(3)
  await expect(page.getByTestId('xray-region-tag').filter({ hasText: 'server' }).first()).toBeVisible()
  await expect(page.getByTestId('xray-region-tag').filter({ hasText: 'client' }).first()).toBeVisible()
  // Toggling off removes the chrome.
  await page.getByTestId('xray-toggle').click()
  await expect(page.getByTestId('xray-region')).toHaveCount(0)
})

test('x-ray on stage 1 shows one all-client region; stage 3 shows mostly server', async ({ page }) => {
  await page.goto('/journey/stage-1/products/aurora-desk-lamp')
  await page.getByTestId('xray-toggle').click()
  await expect(
    page.getByTestId('xray-region-tag').filter({ hasText: 'Stage1PDP' })
  ).toBeVisible({ timeout: 15_000 })
  // X-ray state persists (localStorage) — no second toggle needed after navigating.
  await page.goto('/journey/stage-3/products/aurora-desk-lamp?delay_reviews=0')
  await expect(
    page.getByTestId('xray-region-tag').filter({ hasText: 'PricingPanel' })
  ).toBeVisible({ timeout: 15_000 })
})
