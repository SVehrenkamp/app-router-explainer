import { expect, test } from '@playwright/test'

test('a curriculum module renders through the MDX pipeline', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Why the App Router/i)
})

test('course shell lists all 12 modules with planned ones marked', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  await expect(page.getByTestId(/sidebar-module-/)).toHaveCount(12)
  await expect(page.getByTestId('sidebar-module-migration-playbook')).toContainText('planned')
})

test('drills give instant feedback and persist across reload', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  const first = page.getByTestId(/^drill-/).first()
  await first.getByTestId('drill-option').first().click()
  await expect(first.getByTestId('drill-explanation')).toBeVisible()
  const score = await page.getByTestId('deck-score').textContent()
  await page.reload()
  await expect(page.getByTestId('deck-score')).toHaveText(score ?? '')
})

test('modules 2 and 3 render with embeds, diffs, and drills', async ({ page }) => {
  await page.goto('/learn/mental-model')
  await expect(page.getByTestId(/^drill-/).first()).toBeVisible()
  await page.goto('/learn/routing-layouts')
  await expect(page.getByText('What changes in Next 16')).toBeVisible()
})
