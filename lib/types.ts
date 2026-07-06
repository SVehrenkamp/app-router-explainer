export type Product = {
  slug: string
  name: string
  description: string
  emoji: string
  category: string
  basePriceCents: number
}

export type ProductPage = {
  products: Product[]
  page: number
  pageSize: number
  hasMore: boolean
}

export type Pricing = {
  slug: string
  priceCents: number
  listPriceCents: number
  currency: 'USD'
  promo: string | null
}

export type Inventory = {
  slug: string
  inStock: boolean
  quantity: number
  warehouse: string
}

export type Review = {
  id: string
  author: string
  rating: number
  body: string
}

export type ReviewSummary = {
  slug: string
  averageRating: number
  reviews: Review[]
}

export type ServiceName = 'products' | 'pricing' | 'inventory' | 'reviews'
