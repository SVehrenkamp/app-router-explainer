import { expect, test } from '@playwright/test'

test('search finds products by query param', async ({ page }) => {
  await page.goto('/store/search?q=lamp')
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('product-card')).toHaveCount(1)
})

test('search form submits via GET (no client JS required)', async ({ page }) => {
  await page.goto('/store/search')
  await page.getByRole('searchbox').fill('mug')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/q=mug/)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()
})

test('empty results show a friendly message', async ({ page }) => {
  await page.goto('/store/search?q=zzzz')
  await expect(page.getByText(/No products match/)).toBeVisible()
})
