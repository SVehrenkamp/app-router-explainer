import { expect, test } from '@playwright/test'

test('PLP page 1 is server-rendered HTML (hydration, not client fetch)', async ({ page }) => {
  const res = await page.request.get('/store')
  expect(await res.text()).toContain('Aurora Desk Lamp')
})

test('Load more appends page 2 via client-side React Query', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByTestId('product-card')).toHaveCount(6)
  await page.getByTestId('load-more').click()
  await expect(page.getByTestId('product-card')).toHaveCount(10)
  await expect(page.getByTestId('load-more')).toHaveCount(0) // no page 3
})
