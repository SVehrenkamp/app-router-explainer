import { describe, expect, it } from 'vitest'
import { parseSectionSim } from '@/lib/sim-params'

describe('parseSectionSim', () => {
  it('returns empty overrides when nothing is set', () => {
    const sim = parseSectionSim({})
    expect(sim.pricing).toEqual({})
    expect(sim.reviews).toEqual({})
  })

  it('parses per-service delay and fail keys', () => {
    const sim = parseSectionSim({ delay_reviews: '2500', fail_pricing: '1' })
    expect(sim.reviews).toEqual({ delayMs: 2500 })
    expect(sim.pricing).toEqual({ fail: true })
    expect(sim.inventory).toEqual({})
  })

  it('ignores non-numeric delays and array values', () => {
    const sim = parseSectionSim({ delay_pricing: 'abc', delay_reviews: ['1', '2'] })
    expect(sim.pricing).toEqual({})
    expect(sim.reviews).toEqual({})
  })
})
