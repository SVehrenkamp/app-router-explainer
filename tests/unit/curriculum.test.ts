import { describe, expect, it } from 'vitest'
import { MODULES, moduleBySlug } from '@/lib/curriculum'

describe('curriculum registry', () => {
  it('has 12 modules in spec order with unique slugs', () => {
    expect(MODULES).toHaveLength(12)
    expect(new Set(MODULES.map((m) => m.slug)).size).toBe(12)
    expect(MODULES.map((m) => m.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
  })

  it('modules 1-8 are available with at least 3 valid drills each', () => {
    for (const m of MODULES.slice(0, 8)) {
      expect(m.status).toBe('available')
      expect(m.drills.length).toBeGreaterThanOrEqual(3)
      for (const d of m.drills) {
        expect(d.answerIndex).toBeGreaterThanOrEqual(0)
        expect(d.answerIndex).toBeLessThan(d.options.length)
        expect(d.explanation.length).toBeGreaterThan(20)
      }
    }
  })

  it('modules 9-12 are planned with no drills yet', () => {
    for (const m of MODULES.slice(8)) {
      expect(m.status).toBe('planned')
      expect(m.drills).toEqual([])
    }
  })

  it('moduleBySlug resolves and misses', () => {
    expect(moduleBySlug('mental-model')?.number).toBe(2)
    expect(moduleBySlug('nope')).toBeNull()
  })
})
