import { expect, test } from '@playwright/test'

const FAST_PDP =
  '/store/products/summit-trail-mug?delay_pricing=0&delay_inventory=0&delay_reviews=0'

test('add to cart from the PDP, then manage it on the cart page', async ({ page }) => {
  await page.goto(FAST_PDP)
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('add-to-cart')).toContainText('Added ✓ (1 in cart)')

  await page.goto('/store/cart')
  await expect(page.getByTestId('cart-line')).toHaveCount(1)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()

  // Update quantity via a plain form + Server Action
  await page.getByRole('spinbutton').fill('3')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByTestId('cart-subtotal')).not.toContainText('$0.00')

  // Remove
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
})
