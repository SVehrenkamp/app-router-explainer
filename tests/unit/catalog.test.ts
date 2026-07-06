import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_SIZE, PRODUCTS, getProduct, listProducts } from '@/lib/catalog'

describe('catalog', () => {
  it('has exactly 10 products with unique slugs', () => {
    expect(PRODUCTS).toHaveLength(10)
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(10)
  })

  it('paginates: page 1 has DEFAULT_PAGE_SIZE items and hasMore', () => {
    const page1 = listProducts()
    expect(page1.products).toHaveLength(DEFAULT_PAGE_SIZE)
    expect(page1.page).toBe(1)
    expect(page1.hasMore).toBe(true)
  })

  it('paginates: page 2 has the remaining 4 items and no more', () => {
    const page2 = listProducts({ page: 2 })
    expect(page2.products).toHaveLength(4)
    expect(page2.hasMore).toBe(false)
  })

  it('filters by query across name and category, case-insensitive', () => {
    const results = listProducts({ query: 'LAMP' })
    expect(results.products.length).toBeGreaterThan(0)
    for (const p of results.products) {
      expect(`${p.name} ${p.category}`.toLowerCase()).toContain('lamp')
    }
  })

  it('getProduct returns the product or null', () => {
    expect(getProduct('aurora-desk-lamp')?.name).toBe('Aurora Desk Lamp')
    expect(getProduct('nope')).toBeNull()
  })
})
