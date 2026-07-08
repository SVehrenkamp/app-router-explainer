'use client'

// The X-ray readout: every reported region in RESOLUTION order — the panel is
// a streaming timeline, not a component list. Colors match the in-place
// regions: teal server, indigo client.
import { useXray } from '@/components/xray/provider'

export function XrayPanel() {
  const { enabled, entries, clear } = useXray()
  if (!enabled) return null
  const ordered = [...entries].sort((a, b) => a.resolvedAtMs - b.resolvedAtMs)
  return (
    <aside
      data-testid="xray-panel"
      className="fixed bottom-4 right-4 z-50 w-[22rem] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl"
    >
      <div className="seam h-[3px] w-full" />
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <h3 className="font-display text-sm font-bold tracking-tight">X-ray</h3>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px]">
            <span className="text-teal-700">■ server</span>{' '}
            <span className="ml-1 text-indigo-600">■ client</span>
          </span>
          <button onClick={clear} className="text-xs text-zinc-500 hover:underline">
            Clear
          </button>
        </div>
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-y border-zinc-100 bg-zinc-50/60 font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            <th className="px-4 py-1.5 font-medium">#</th>
            <th className="py-1.5 font-medium">Component</th>
            <th className="py-1.5 font-medium">Kind</th>
            <th className="py-1.5 font-medium">Service</th>
            <th className="py-1.5 pr-4 font-medium">Resolved</th>
          </tr>
        </thead>
        <tbody>
          {ordered.map((entry, i) => (
            <tr key={entry.label} className="border-b border-zinc-50 last:border-0">
              <td className="figures px-4 py-1 text-zinc-400">{i + 1}</td>
              <td className="max-w-[10rem] truncate py-1 font-mono">{entry.label}</td>
              <td
                className={`py-1 font-mono font-medium ${
                  entry.kind === 'server' ? 'text-teal-700' : 'text-indigo-600'
                }`}
              >
                {entry.kind}
              </td>
              <td className="figures py-1">
                {entry.serviceMs !== undefined ? `${entry.serviceMs}ms` : '—'}
              </td>
              <td className="figures py-1 pr-4">{entry.resolvedAtMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-zinc-100 px-4 py-2 text-[11px] leading-snug text-zinc-500">
        Rows appear when each region hydrates or streams in — the order IS the streaming story.
      </p>
    </aside>
  )
}
