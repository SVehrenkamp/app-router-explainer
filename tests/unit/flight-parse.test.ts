import { describe, expect, it } from 'vitest'
import { parseFlightPayload } from '@/lib/flight-parse'

const SAMPLE = [
  '1:HL["/_next/static/css/app.css","style"]',
  '0:{"P":null,"b":"buildid","c":["","store"]}',
  '2:I[39476,["chunk.js"],"ProductGrid"]',
  '3:"Aurora Desk Lamp"',
].join('\n')

describe('parseFlightPayload', () => {
  it('splits rows and classifies kinds', () => {
    const { rows } = parseFlightPayload(SAMPLE)
    expect(rows.map((r) => [r.id, r.kind])).toEqual([
      ['1', 'hint'],
      ['0', 'tree'],
      ['2', 'module'],
      ['3', 'text'],
    ])
  })

  it('counts bytes per row and in total', () => {
    const { rows, totalBytes } = parseFlightPayload(SAMPLE)
    expect(totalBytes).toBe(Buffer.byteLength(SAMPLE, 'utf8'))
    expect(rows.reduce((s, r) => s + r.bytes, 0)).toBeGreaterThanOrEqual(totalBytes - rows.length)
  })

  it('folds continuation lines into the previous row', () => {
    const multi = '0:{"a":1}\nnot-a-new-row\n1:I[1,["c.js"],"X"]'
    const { rows } = parseFlightPayload(multi)
    expect(rows).toHaveLength(2)
    expect(rows[0].bytes).toBeGreaterThan('0:{"a":1}'.length)
  })

  it('returns empty for empty payloads', () => {
    expect(parseFlightPayload('').rows).toEqual([])
  })
})
