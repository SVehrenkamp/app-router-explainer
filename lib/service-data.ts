// Deterministic per-product data for the pricing/inventory/reviews services.
// Derived from a slug hash instead of randomness so every request (and test) agrees.
import type { Inventory, Pricing, Product, Review, ReviewSummary } from '@/lib/types'

function hash(input: string): number {
  let h = 0
  for (const ch of input) h = (h * 31 + ch.charCodeAt(0)) % 100_000
  return h
}

export function pricingFor(product: Product): Pricing {
  const discountPct = hash(product.slug) % 30 // 0–29%
  const priceCents = Math.round((product.basePriceCents * (100 - discountPct)) / 100)
  return {
    slug: product.slug,
    priceCents,
    listPriceCents: product.basePriceCents,
    currency: 'USD',
    promo: discountPct >= 15 ? `${discountPct}% off today` : null,
  }
}

const WAREHOUSES = ['Reno NV', 'Columbus OH', 'Allentown PA']

export function inventoryFor(product: Product): Inventory {
  const quantity = hash(`${product.slug}:inv`) % 40 // 0–39
  return {
    slug: product.slug,
    inStock: quantity > 0,
    quantity,
    warehouse: WAREHOUSES[hash(product.slug) % WAREHOUSES.length],
  }
}

const REVIEW_TEMPLATES: Array<Omit<Review, 'id'>> = [
  { author: 'Priya', rating: 5, body: 'Exactly as described. Would buy again.' },
  { author: 'Marcus', rating: 4, body: 'Great quality, shipping took a few days.' },
  { author: 'Elena', rating: 5, body: 'A gift for my sister — she loves it.' },
  { author: 'Sam', rating: 3, body: 'Good, but smaller than I expected.' },
  { author: 'Dana', rating: 4, body: 'Solid build, nice finish.' },
]

export function reviewsFor(product: Product): ReviewSummary {
  const count = 2 + (hash(`${product.slug}:rev`) % 3) // 2–4 reviews
  const offset = hash(product.slug) % REVIEW_TEMPLATES.length
  const reviews = Array.from({ length: count }, (_, i) => {
    const t = REVIEW_TEMPLATES[(offset + i) % REVIEW_TEMPLATES.length]
    return { ...t, id: `${product.slug}-r${i + 1}` }
  })
  const averageRating =
    Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
  return { slug: product.slug, averageRating, reviews }
}
