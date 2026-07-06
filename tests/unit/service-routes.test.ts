import { describe, expect, it } from 'vitest'
import { GET as getProducts } from '@/app/api/services/products/route'
import { GET as getProductDetail } from '@/app/api/services/products/[slug]/route'
import { GET as getPricing } from '@/app/api/services/pricing/[slug]/route'
import { GET as getInventory } from '@/app/api/services/inventory/[slug]/route'
import { GET as getReviews } from '@/app/api/services/reviews/[slug]/route'

const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('products service', () => {
  it('returns a page of products with service headers', async () => {
    const res = await getProducts(
      new Request('http://x/api/services/products?delay=0&page=1')
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('x-service')).toBe('products')
    expect(res.headers.get('cache-control')).toContain('s-maxage=300')
    const body = await res.json()
    expect(body.products).toHaveLength(6)
    expect(body.hasMore).toBe(true)
  })

  it('filters with ?q=', async () => {
    const res = await getProducts(new Request('http://x/api/services/products?delay=0&q=lamp'))
    const body = await res.json()
    expect(body.products.map((p: { slug: string }) => p.slug)).toContain('aurora-desk-lamp')
  })

  it('returns 503 when ?fail=1', async () => {
    const res = await getProducts(new Request('http://x/api/services/products?delay=0&fail=1'))
    expect(res.status).toBe(503)
    expect((await res.json()).error).toBe('products service unavailable')
  })
})

describe('product detail service', () => {
  it('returns the product or 404', async () => {
    const ok = await getProductDetail(
      new Request('http://x/api/services/products/aurora-desk-lamp?delay=0'),
      slugParams('aurora-desk-lamp')
    )
    expect(ok.status).toBe(200)
    expect((await ok.json()).name).toBe('Aurora Desk Lamp')

    const missing = await getProductDetail(
      new Request('http://x/api/services/products/nope?delay=0'),
      slugParams('nope')
    )
    expect(missing.status).toBe(404)
  })
})

describe('per-slug services are deterministic', () => {
  it('pricing returns identical bodies across calls, never exceeding list price', async () => {
    const call = async () =>
      (
        await getPricing(
          new Request('http://x/api/services/pricing/aurora-desk-lamp?delay=0'),
          slugParams('aurora-desk-lamp')
        )
      ).json()
    const [a, b] = [await call(), await call()]
    expect(a).toEqual(b)
    expect(a.priceCents).toBeLessThanOrEqual(a.listPriceCents)
    expect(a.currency).toBe('USD')
  })

  it('inventory and reviews return coherent shapes', async () => {
    const inv = await (
      await getInventory(
        new Request('http://x/api/services/inventory/harbor-tote-bag?delay=0'),
        slugParams('harbor-tote-bag')
      )
    ).json()
    expect(inv.inStock).toBe(inv.quantity > 0)

    const rev = await (
      await getReviews(
        new Request('http://x/api/services/reviews/harbor-tote-bag?delay=0'),
        slugParams('harbor-tote-bag')
      )
    ).json()
    expect(rev.reviews.length).toBeGreaterThanOrEqual(2)
    expect(rev.averageRating).toBeGreaterThanOrEqual(1)
    expect(rev.averageRating).toBeLessThanOrEqual(5)
  })
})
