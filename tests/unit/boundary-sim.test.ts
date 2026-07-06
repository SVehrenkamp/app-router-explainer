import { describe, expect, it } from 'vitest'
import { PDP_TREE, STAGE_PRESETS } from '@/lib/boundary-model'
import { simulateBoundary, type BoundaryNode } from '@/lib/boundary-sim'

describe('simulateBoundary on the PDP model', () => {
  it('stage-3 preset has zero violations and the smallest client cost', () => {
    const s3 = simulateBoundary(PDP_TREE, new Set(STAGE_PRESETS['stage-3']))
    expect(s3.violations).toEqual([])
    const s1 = simulateBoundary(PDP_TREE, new Set(STAGE_PRESETS['stage-1']))
    expect(s1.clientKB).toBeGreaterThan(s3.clientKB)
  })

  it('putting the boundary at the root flags every async-server descendant', () => {
    const result = simulateBoundary(PDP_TREE, new Set(['page']))
    const kinds = result.violations.map((v) => v.kind)
    expect(kinds).toContain('async-under-client')
    expect(result.clientIds.size).toBeGreaterThan(5)
  })

  it('no boundary at all flags hooks components', () => {
    const result = simulateBoundary(PDP_TREE, new Set())
    expect(result.violations.some((v) => v.kind === 'hooks-outside-client')).toBe(true)
    expect(result.clientKB).toBe(0)
  })
})

describe('simulateBoundary primitives', () => {
  const tiny: BoundaryNode = {
    id: 'root',
    name: 'Root',
    nature: 'neutral',
    kb: 1,
    children: [
      {
        id: 'leaf',
        name: 'Leaf',
        nature: 'neutral',
        kb: 2,
        props: [{ name: 'onSelect', serializable: false }],
      },
    ],
  }

  it('flags a non-serializable prop only at the boundary edge', () => {
    const atLeaf = simulateBoundary(tiny, new Set(['leaf']))
    expect(atLeaf.violations.map((v) => v.kind)).toEqual(['non-serializable-prop'])
    const atRoot = simulateBoundary(tiny, new Set(['root']))
    expect(atRoot.violations.some((v) => v.kind === 'non-serializable-prop')).toBe(false)
  })

  it('sums kb over exactly the client subtree', () => {
    expect(simulateBoundary(tiny, new Set(['leaf'])).clientKB).toBe(2)
    expect(simulateBoundary(tiny, new Set(['root'])).clientKB).toBe(3)
  })
})
