import { describe, expect, it } from 'vitest'
import { CACHE_TARGETS, classifySamples } from '@/lib/cache-lab'

describe('classifySamples', () => {
  it('marks the first sample a miss and repeats as hits', () => {
    const t = (at: number, gen: string) => ({ at, generatedAt: gen, cacheControl: null })
    const points = classifySamples([t(1, 'a'), t(2, 'a'), t(3, 'b'), t(4, 'b')])
    expect(points.map((p) => p.hit)).toEqual([false, true, false, true])
  })

  it('handles empty input', () => {
    expect(classifySamples([])).toEqual([])
  })
})

describe('CACHE_TARGETS', () => {
  it('covers the four route configurations with distinct paths', () => {
    expect(CACHE_TARGETS.map((t) => t.id).sort()).toEqual(['dynamic', 'revalidate', 'static', 'tagged'])
    expect(new Set(CACHE_TARGETS.map((t) => t.path)).size).toBe(4)
  })
})
