import { expect, test } from '@playwright/test'

test('labs index lists the three labs', async ({ page }) => {
  await page.goto('/labs')
  await expect(page.getByTestId('lab-card')).toHaveCount(3)
  for (const title of ['Boundary Explorer', 'Cache Lab', 'RSC Payload Inspector']) {
    await expect(page.getByTestId('lab-card').filter({ hasText: title })).toBeVisible()
  }
})

test('boundary explorer recomputes cost and violations as the boundary moves', async ({ page }) => {
  await page.goto('/labs/boundary-explorer')
  // Stage 3 preset: minimal client JS, zero violations.
  await page.getByTestId('preset-stage-3').click()
  await expect(page.getByTestId('boundary-violations')).toContainText('No violations')
  const kbStage3 = await page.getByTestId('boundary-kb').textContent()

  // Boundary at the top: cost rises, async-under-client violations appear.
  await page.getByTestId('preset-stage-1').click()
  await expect(page.getByTestId('boundary-violations')).toContainText('async server component')
  const kbStage1 = await page.getByTestId('boundary-kb').textContent()
  expect(parseFloat(kbStage1 ?? '0')).toBeGreaterThan(parseFloat(kbStage3 ?? '0'))

  // Manual toggle works too.
  await page.getByTestId('preset-stage-3').click()
  await page.getByTestId('boundary-toggle-page').check()
  await expect(page.getByTestId('boundary-violations')).toContainText('async server component')
})
