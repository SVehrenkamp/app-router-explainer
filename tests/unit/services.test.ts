import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

  it('appends fail=1 when fail is true', async () => {
    const mock = stubFetch(200, {})
    await getPricing('x', { fail: true })
    const url = String(mock.mock.calls[0][0])
    expect(url).toContain('fail=1')
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

describe('service base URL resolution', () => {
  beforeEach(() => vi.resetModules())

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.doUnmock('next/headers')
    vi.resetModules()
  })

  it('derives the base from the request host when SERVICES_BASE_URL is unset', async () => {
    vi.doMock('next/headers', () => ({
      headers: async () =>
        new Headers({ host: 'demo.example.workers.dev', 'x-forwarded-proto': 'https' }),
    }))
    const mock = stubFetch(200, {})
    const { getPricing: freshGetPricing } = await import('@/lib/services')
    await freshGetPricing('x')
    const url = String(mock.mock.calls[0][0])
    expect(url).toMatch(/^https:\/\/demo\.example\.workers\.dev\/api\/services\/pricing\/x/)
  })

  it('prefers SERVICES_BASE_URL over the request host', async () => {
    vi.stubEnv('SERVICES_BASE_URL', 'https://configured.example.com')
    vi.doMock('next/headers', () => ({
      headers: async () => new Headers({ host: 'demo.example.workers.dev' }),
    }))
    const mock = stubFetch(200, {})
    const { getPricing: freshGetPricing } = await import('@/lib/services')
    await freshGetPricing('x')
    expect(String(mock.mock.calls[0][0])).toMatch(/^https:\/\/configured\.example\.com\//)
  })

  it('falls back to localhost:3000 outside a request scope', async () => {
    vi.doMock('next/headers', () => ({
      headers: async () => {
        throw new Error('headers called outside a request scope')
      },
    }))
    const mock = stubFetch(200, {})
    const { getPricing: freshGetPricing } = await import('@/lib/services')
    await freshGetPricing('x')
    expect(String(mock.mock.calls[0][0])).toMatch(/^http:\/\/localhost:3000\//)
  })
})
