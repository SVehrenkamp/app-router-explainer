import { afterEach, describe, expect, it, vi } from 'vitest'
import { ServiceError, getPricing, getProductDetail } from '@/lib/services'

afterEach(() => vi.unstubAllGlobals())

function stubFetch(status: number, body: unknown) {
  const mock = vi.fn(async (_: RequestInfo | URL) => Response.json(body, { status }))
  vi.stubGlobal('fetch', mock)
  return mock
}

describe('services client', () => {
  it('returns data plus a timing entry', async () => {
    stubFetch(200, { slug: 'x', priceCents: 100, listPriceCents: 100, currency: 'USD', promo: null })
    const result = await getPricing('x')
    expect(result.data.priceCents).toBe(100)
    expect(result.timing.service).toBe('pricing')
    expect(result.timing.ms).toBeGreaterThanOrEqual(0)
  })

  it('appends sim overrides to the request URL', async () => {
    const mock = stubFetch(200, {})
    await getPricing('x', { delayMs: 0, fail: false })
    const url = String(mock.mock.calls[0][0])
    expect(url).toContain('/api/services/pricing/x')
    expect(url).toContain('delay=0')
  })

  it('throws ServiceError on non-OK responses', async () => {
    stubFetch(503, { error: 'down' })
    await expect(getPricing('x')).rejects.toThrowError(ServiceError)
  })

  it('getProductDetail returns null on 404 instead of throwing', async () => {
    stubFetch(404, { error: 'not found' })
    await expect(getProductDetail('nope')).resolves.toBeNull()
  })
})
