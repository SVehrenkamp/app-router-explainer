import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DELAY_MS,
  parseSimFlags,
  serviceHeaders,
  simulateService,
} from '@/lib/service-utils'

describe('parseSimFlags', () => {
  it('uses the per-service default delay when no param is given', () => {
    const flags = parseSimFlags('reviews', new URL('http://x/api?other=1'))
    expect(flags).toEqual({ delayMs: DEFAULT_DELAY_MS.reviews, fail: false })
  })

  it('honors ?delay= override and caps it at 10000', () => {
    expect(parseSimFlags('pricing', new URL('http://x/api?delay=50')).delayMs).toBe(50)
    expect(parseSimFlags('pricing', new URL('http://x/api?delay=99999')).delayMs).toBe(10000)
  })

  it('falls back to the default on a non-numeric or negative delay', () => {
    expect(parseSimFlags('products', new URL('http://x/api?delay=abc')).delayMs).toBe(
      DEFAULT_DELAY_MS.products
    )
    expect(parseSimFlags('products', new URL('http://x/api?delay=-5')).delayMs).toBe(
      DEFAULT_DELAY_MS.products
    )
  })

  it('parses fail=1 and fail=true', () => {
    expect(parseSimFlags('products', new URL('http://x/api?fail=1')).fail).toBe(true)
    expect(parseSimFlags('products', new URL('http://x/api?fail=true')).fail).toBe(true)
    expect(parseSimFlags('products', new URL('http://x/api?fail=0')).fail).toBe(false)
  })
})

describe('simulateService', () => {
  it('resolves with the parsed flags', async () => {
    const flags = await simulateService(
      'inventory',
      new Request('http://x/api?delay=0&fail=1')
    )
    expect(flags).toEqual({ delayMs: 0, fail: true })
  })
})

describe('serviceHeaders', () => {
  it('emits x-service, server-timing, and cache-control', () => {
    expect(serviceHeaders('pricing', 12, 'private, no-store')).toEqual({
      'x-service': 'pricing',
      'server-timing': 'svc;dur=12',
      'cache-control': 'private, no-store',
    })
  })
})
