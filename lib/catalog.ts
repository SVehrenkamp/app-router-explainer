// In-memory product catalog. Stands in for the catalog microservice's database.
// Deterministic fixture data — no randomness, so demos and tests are stable.
import type { Product, ProductPage } from '@/lib/types'

export const DEFAULT_PAGE_SIZE = 6

export const PRODUCTS: Product[] = [
  { slug: 'aurora-desk-lamp', name: 'Aurora Desk Lamp', description: 'A dimmable desk lamp with a warm, sunrise-inspired glow.', emoji: '🛋️', category: 'Lighting', basePriceCents: 8900 },
  { slug: 'cascade-water-bottle', name: 'Cascade Water Bottle', description: 'Insulated steel bottle that keeps drinks cold for 24 hours.', emoji: '🥤', category: 'Kitchen', basePriceCents: 3400 },
  { slug: 'drift-linen-throw', name: 'Drift Linen Throw', description: 'A stonewashed linen throw blanket for slow mornings.', emoji: '🧣', category: 'Textiles', basePriceCents: 12800 },
  { slug: 'ember-candle-set', name: 'Ember Candle Set', description: 'Three hand-poured candles in cedar, fig, and smoke.', emoji: '🕯️', category: 'Home Fragrance', basePriceCents: 5600 },
  { slug: 'harbor-tote-bag', name: 'Harbor Tote Bag', description: 'A waxed-canvas tote built for farmers markets and day trips.', emoji: '👜', category: 'Bags', basePriceCents: 7200 },
  { slug: 'meridian-wall-clock', name: 'Meridian Wall Clock', description: 'A silent-sweep wall clock in brushed brass.', emoji: '🕰️', category: 'Decor', basePriceCents: 9800 },
  { slug: 'nimbus-throw-pillow', name: 'Nimbus Throw Pillow', description: 'A cloud-soft bouclé pillow in oat.', emoji: '🛏️', category: 'Textiles', basePriceCents: 4600 },
  { slug: 'orbit-desk-organizer', name: 'Orbit Desk Organizer', description: 'A modular walnut organizer that spins.', emoji: '🗄️', category: 'Office', basePriceCents: 6400 },
  { slug: 'summit-trail-mug', name: 'Summit Trail Mug', description: 'An enamel camp mug that shrugs off drops.', emoji: '☕', category: 'Kitchen', basePriceCents: 2400 },
  { slug: 'willow-plant-stand', name: 'Willow Plant Stand', description: 'A three-tier rattan stand for your indoor jungle.', emoji: '🪴', category: 'Decor', basePriceCents: 8200 },
]

export function listProducts(opts?: {
  page?: number
  pageSize?: number
  query?: string
}): ProductPage {
  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = Math.max(1, opts?.pageSize ?? DEFAULT_PAGE_SIZE)
  const query = opts?.query?.trim().toLowerCase()

  const matches = query
    ? PRODUCTS.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query))
    : PRODUCTS

  const start = (page - 1) * pageSize
  return {
    products: matches.slice(start, start + pageSize),
    page,
    pageSize,
    hasMore: start + pageSize < matches.length,
  }
}

export function getProduct(slug: string): Product | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null
}
