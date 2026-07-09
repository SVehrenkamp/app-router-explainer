import { expect, test } from '@playwright/test'

test('context bridge: same selectors serve server and client with zero client fetches', async ({
  page,
}) => {
  // Block ALL service calls from the browser. The client provider must get its
  // data across the boundary by serialization, not by refetching.
  await page.route('**/api/services/**', (route) => route.abort())
  await page.goto('/journey/context-bridge/products/aurora-desk-lamp')

  const serverPrice = await page.getByTestId('bridge-server-price').textContent()
  const clientPrice = await page.getByTestId('bridge-client-price').textContent()
  expect(serverPrice).toMatch(/\$\d/)
  // Identical output — same bundle, same selector, different environments.
  expect(clientPrice).toBe(serverPrice)
  await expect(page.getByTestId('bridge-server-discount')).toContainText('%')
  await expect(page.getByTestId('bridge-client-interactive')).toBeVisible()
})
