import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLegacyJson, legacyServiceBase } from '@/lib/legacy-fetch'

afterEach(() => vi.unstubAllGlobals())

describe('legacyServiceBase', () => {
  it('returns empty string in the browser (relative URLs)', () => {
    vi.stubGlobal('window', {})
    expect(legacyServiceBase()).toBe('')
  })

  it('derives proto://host from the incoming request on the server', () => {
    expect(
      legacyServiceBase({ headers: { host: 'demo.example.workers.dev', 'x-forwarded-proto': 'https' } })
    ).toBe('https://demo.example.workers.dev')
  })

  it('defaults proto to http and falls back to localhost without a req', () => {
    expect(legacyServiceBase({ headers: { host: 'localhost:3111' } })).toBe('http://localhost:3111')
    expect(legacyServiceBase()).toBe('http://localhost:3000')
  })
})

describe('fetchLegacyJson', () => {
  it('fetches relative in the browser and parses JSON', async () => {
    vi.stubGlobal('window', {})
    const mock = vi.fn(async (_: RequestInfo | URL) => Response.json({ ok: true }))
    vi.stubGlobal('fetch', mock)
    await expect(fetchLegacyJson('/api/services/products')).resolves.toEqual({ ok: true })
    expect(String(mock.mock.calls[0][0])).toBe('/api/services/products')
  })

  it('throws with path and status on non-OK', async () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({}, { status: 503 })))
    await expect(fetchLegacyJson('/x')).rejects.toThrowError('/x responded 503')
  })
})
