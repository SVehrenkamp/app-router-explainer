'use client'

// Fetches a route the way the App Router does on navigation — with the RSC
// header — and annotates the flight payload that comes back. This is the
// payload the "smaller client bundles" story is about: server output crosses
// as compact data rows, and only 'module' rows point at JS the browser loads.
import { useState } from 'react'
import { parseFlightPayload, type FlightRow } from '@/lib/flight-parse'

const ROUTES = [
  '/store',
  '/store/products/aurora-desk-lamp',
  '/journey/stage-3/products/aurora-desk-lamp',
]

const KIND_STYLES: Record<FlightRow['kind'], string> = {
  module: 'bg-indigo-100 text-indigo-800',
  tree: 'bg-teal-100 text-teal-800',
  text: 'bg-zinc-100 text-zinc-700',
  hint: 'bg-amber-100 text-amber-800',
  other: 'bg-zinc-100 text-zinc-500',
}

export function RscInspector() {
  const [route, setRoute] = useState(ROUTES[0])
  const [state, setState] = useState<
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'done'; rows: FlightRow[]; totalBytes: number }
  >({ status: 'idle' })

  const inspect = async () => {
    setState({ status: 'loading' })
    try {
      const res = await fetch(route, { headers: { RSC: '1' } })
      const body = await res.text()
      if (body.trimStart().startsWith('<!DOCTYPE') || body.trimStart().startsWith('<html')) {
        setState({
          status: 'error',
          message:
            'Got HTML instead of a flight payload — the server did not honor the RSC header for this route.',
        })
        return
      }
      const { rows, totalBytes } = parseFlightPayload(body)
      setState({ status: 'done', rows, totalBytes })
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof Error ? error.message : 'fetch failed',
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          data-testid="rsc-route-select"
          value={route}
          onChange={(e) => setRoute(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        >
          {ROUTES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button
          data-testid="rsc-fetch"
          onClick={inspect}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          {state.status === 'loading' ? 'Fetching…' : 'Fetch flight payload'}
        </button>
        {state.status === 'done' && (
          <span data-testid="rsc-total" className="font-mono text-sm text-zinc-600">
            {state.rows.length} rows · {state.totalBytes.toLocaleString()} bytes
          </span>
        )}
      </div>

      {state.status === 'error' && (
        <p data-testid="rsc-error" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
          {state.message}
        </p>
      )}

      {state.status === 'done' && (
        <div className="space-y-1 font-mono text-xs">
          {state.rows.map((row, i) => (
            <div key={`${row.id}-${i}`} data-testid="rsc-row" className="flex items-start gap-2">
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 font-semibold ${KIND_STYLES[row.kind]}`}
              >
                {row.kind}
              </span>
              <span className="shrink-0 text-zinc-400">{row.bytes}B</span>
              <span className="break-all text-zinc-700">{row.preview}</span>
            </div>
          ))}
          <p className="pt-2 text-zinc-500">
            Heuristic annotation of an undocumented wire format — kinds are a reading aid, not a
            spec. <span className="text-indigo-700">module</span> rows reference client-component JS
            the browser loads; <span className="text-teal-700">tree</span> rows are server
            output crossing as data.
          </p>
        </div>
      )}
    </div>
  )
}
