import { describe, expect, it } from 'vitest'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

describe('journey stage registry', () => {
  it('has exactly stages 0..3 in order', () => {
    expect(JOURNEY_STAGES.map((s) => s.stage)).toEqual([0, 1, 2, 3])
  })

  it('stage 0 lives in the pages router, stages 1-3 in the app router', () => {
    expect(JOURNEY_STAGES[0].router).toBe('pages')
    expect(JOURNEY_STAGES[0].pdpRoute(DEMO_SLUG)).toBe(`/legacy/products/${DEMO_SLUG}`)
    for (const stage of JOURNEY_STAGES.slice(1)) {
      expect(stage.router).toBe('app')
      expect(stage.pdpRoute(DEMO_SLUG)).toBe(`/journey/stage-${stage.stage}/products/${DEMO_SLUG}`)
    }
  })

  it('every stage carries a source id and a plausible tree split', () => {
    for (const stage of JOURNEY_STAGES) {
      expect(stage.sourceId.length).toBeGreaterThan(0)
      expect(stage.treeSplit.server + stage.treeSplit.client).toBeGreaterThan(0)
    }
  })
})
