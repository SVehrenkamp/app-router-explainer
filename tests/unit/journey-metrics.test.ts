import { describe, expect, it } from 'vitest'
import { MANIFEST_ROUTES, sumRouteKB, uniqueRouteKB } from '@/lib/journey-metrics'
import { JOURNEY_STAGES } from '@/lib/journey'

describe('sumRouteKB', () => {
  it('sums deduped file sizes and rounds to 0.1 KB', () => {
    const sizes: Record<string, number> = { 'a.js': 10_240, 'b.js': 5_120 }
    expect(sumRouteKB(['a.js', 'b.js', 'a.js'], (f) => sizes[f])).toBe(15)
  })

  it('ignores non-JS entries (css ships regardless of the boundary)', () => {
    const sizes: Record<string, number> = { 'a.js': 1024, 'style.css': 999_999 }
    expect(sumRouteKB(['a.js', 'style.css'], (f) => sizes[f])).toBe(1)
  })
})

describe('MANIFEST_ROUTES', () => {
  it('covers every journey stage exactly once', () => {
    expect(MANIFEST_ROUTES.map((r) => r.stage).sort()).toEqual(
      JOURNEY_STAGES.map((s) => s.stage)
    )
  })

  it('uses pages-router keys for stage 0 and app-router keys for the rest', () => {
    const stage0 = MANIFEST_ROUTES.find((r) => r.stage === 0)!
    expect(stage0.router).toBe('pages')
    expect(stage0.manifestKey).toBe('/legacy/products/[slug]')
    const stage3 = MANIFEST_ROUTES.find((r) => r.stage === 3)!
    expect(stage3.manifestKey).toBe('/journey/stage-3/products/[slug]/page')
  })
})

describe('uniqueRouteKB', () => {
  it('counts only files no sibling route ships (the page-specific chunk)', () => {
    const sizes: Record<string, number> = {
      'shared-framework.js': 300 * 1024,
      'stage1-page.js': 40 * 1024,
      'stage3-page.js': 4 * 1024,
    }
    const stage1 = ['shared-framework.js', 'stage1-page.js']
    const stage3 = ['shared-framework.js', 'stage3-page.js']
    expect(uniqueRouteKB(stage1, [stage3], (f) => sizes[f])).toBe(40)
    expect(uniqueRouteKB(stage3, [stage1], (f) => sizes[f])).toBe(4)
  })
})
