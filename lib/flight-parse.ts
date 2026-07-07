// Minimal parser for React flight payloads (the RSC wire format) — enough to
// ANNOTATE, not to reconstruct. Rows are `ID:BODY`; the interesting split for
// learners is module references (client components the browser must load)
// versus serialized tree/props (server output that ships as data, not JS).
// The format is undocumented and version-specific; this parser is heuristic
// by design and the lab labels it as such.
export type FlightRow = {
  id: string
  kind: 'module' | 'tree' | 'text' | 'hint' | 'other'
  bytes: number
  preview: string
}

const ROW_RE = /^([0-9a-f]+):(.*)$/s

function classify(body: string): FlightRow['kind'] {
  if (body.startsWith('I[') || body.startsWith('I{')) return 'module'
  if (body.startsWith('HL') || body.startsWith('H[')) return 'hint'
  if (body.startsWith('[') || body.startsWith('{')) return 'tree'
  if (body.startsWith('"')) return 'text'
  return 'other'
}

export function parseFlightPayload(payload: string): { rows: FlightRow[]; totalBytes: number } {
  const totalBytes = new TextEncoder().encode(payload).length
  const rows: FlightRow[] = []
  if (!payload) return { rows, totalBytes }

  for (const line of payload.split('\n')) {
    const match = ROW_RE.exec(line)
    if (!match) {
      // Continuation of a multi-line string row: fold into the previous row.
      if (rows.length > 0) rows[rows.length - 1].bytes += new TextEncoder().encode(line).length + 1
      continue
    }
    const [, id, body] = match
    rows.push({
      id,
      kind: classify(body),
      bytes: new TextEncoder().encode(line).length,
      preview: line.length > 160 ? `${line.slice(0, 160)}…` : line,
    })
  }
  return { rows, totalBytes }
}
