import { describe, expect, it } from 'vitest'
import { emptyProgress, moduleProgress, parseProgress, recordAnswer } from '@/lib/progress'

describe('parseProgress', () => {
  it('tolerates null, garbage, and foreign versions', () => {
    expect(parseProgress(null)).toEqual(emptyProgress())
    expect(parseProgress('not json')).toEqual(emptyProgress())
    expect(parseProgress('{"v":99,"modules":{}}')).toEqual(emptyProgress())
  })

  it('round-trips a valid doc', () => {
    const doc = recordAnswer(emptyProgress(), 'm1', 'd1', true, 2, '2026-07-06T00:00:00Z')
    expect(parseProgress(JSON.stringify(doc))).toEqual(doc)
  })
})

describe('recordAnswer / moduleProgress', () => {
  const NOW = '2026-07-06T00:00:00Z'

  it('completes a module only when every drill has been answered correctly', () => {
    let doc = recordAnswer(emptyProgress(), 'm1', 'd1', true, 2, NOW)
    expect(moduleProgress(doc, 'm1', 2).complete).toBe(false)
    doc = recordAnswer(doc, 'm1', 'd2', true, 2, NOW)
    expect(moduleProgress(doc, 'm1', 2)).toEqual({ answered: 2, correct: 2, complete: true })
    expect(doc.modules.m1.completedAt).toBe(NOW)
  })

  it('records wrong answers without completing, and later correction completes', () => {
    let doc = recordAnswer(emptyProgress(), 'm1', 'd1', false, 1, NOW)
    expect(moduleProgress(doc, 'm1', 1)).toEqual({ answered: 1, correct: 0, complete: false })
    doc = recordAnswer(doc, 'm1', 'd1', true, 1, NOW)
    expect(moduleProgress(doc, 'm1', 1).complete).toBe(true)
  })

  it('is immutable', () => {
    const base = emptyProgress()
    recordAnswer(base, 'm1', 'd1', true, 1, NOW)
    expect(base.modules.m1).toBeUndefined()
  })
})
