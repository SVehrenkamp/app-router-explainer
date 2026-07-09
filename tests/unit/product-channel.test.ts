import { describe, expect, it } from 'vitest'
import {
  selectDiscountPercent,
  selectDisplayPrice,
  selectName,
  type ProductBundle,
} from '@/lib/product-channel/selectors'

const bundle: ProductBundle = {
  product: {
    slug: 'aurora-desk-lamp',
    name: 'Aurora Desk Lamp',
    description: 'x',
    emoji: '💡',
    category: 'lighting',
    basePriceCents: 8900,
  },
  pricing: { slug: 'aurora-desk-lamp', priceCents: 7209, listPriceCents: 8900, currency: 'USD', promo: null },
}

describe('product selectors (pure, shared by both worlds)', () => {
  it('formats the display price', () => {
    expect(selectDisplayPrice(bundle)).toBe('$72.09')
  })

  it('computes the discount as a derived property', () => {
    expect(selectDiscountPercent(bundle)).toBe(19)
  })

  it('returns null discount when price is not below list', () => {
    const full = { ...bundle, pricing: { ...bundle.pricing, priceCents: 8900 } }
    expect(selectDiscountPercent(full)).toBeNull()
    expect(selectName(bundle)).toBe('Aurora Desk Lamp')
  })
})
