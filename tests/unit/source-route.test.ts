import { describe, expect, it, vi } from 'vitest'

// The deploy target (Cloudflare Workers) has no repo on disk, so the source
// API must serve from the build-time snapshot — never from request-time fs
// reads. Poison fs to prove it.
vi.mock('node:fs/promises', () => ({
  readFile: vi.fn(async () => {
    throw new Error('request-time fs read — not available in the deployed worker')
  }),
}))

import { GET } from '@/app/api/source/[id]/route'

describe('source API', () => {
  it('serves highlighted source without touching the filesystem', async () => {
    const res = await GET(new Request('http://test/api/source/store-plp'), {
      params: Promise.resolve({ id: 'store-plp' }),
    })
    expect(res.status).toBe(200)
    const body = (await res.json()) as { title: string; html: string }
    expect(body.title).toContain('PLP')
    expect(body.html).toContain('<pre')
  })

  it('404s on unknown ids', async () => {
    const res = await GET(new Request('http://test/api/source/nope'), {
      params: Promise.resolve({ id: 'nope' }),
    })
    expect(res.status).toBe(404)
  })
})
