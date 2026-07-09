// STEP 1 of the context-bridge refactor: extract the pure core.
//
// The old ProductContext hooks did two jobs at once: LOCATE the product data
// (useContext) and DERIVE values from it (price, computed properties). Only
// the locating is environment-specific — deriving is pure. Pull the selectors
// into a module with no React imports and both worlds can share them
// verbatim. This file is the part of your context you do NOT rewrite.
import { formatPrice } from '@/lib/format'
import type { Pricing, Product } from '@/lib/types'

export type ProductBundle = { product: Product; pricing: Pricing }

export const selectName = (b: ProductBundle) => b.product.name

export const selectDisplayPrice = (b: ProductBundle) => formatPrice(b.pricing.priceCents)

// A computed property — the kind of derived value selector-based contexts
// exist for. Lives once, runs anywhere.
export const selectDiscountPercent = (b: ProductBundle): number | null =>
  b.pricing.priceCents < b.pricing.listPriceCents
    ? Math.round((1 - b.pricing.priceCents / b.pricing.listPriceCents) * 100)
    : null
