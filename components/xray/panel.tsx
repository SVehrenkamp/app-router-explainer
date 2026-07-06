'use client'

import { useXray } from '@/components/xray/provider'

export function XrayPanel() {
  const { enabled, entries, clear } = useXray()
  if (!enabled) return null
  return (
    <aside
      data-testid="xray-panel"
      className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-violet-300 bg-white p-4 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-violet-700">X-ray</h3>
        <button onClick={clear} className="text-xs text-zinc-500 hover:underline">
          Clear
        </button>
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-zinc-500">
            <th className="pb-1">Component</th>
            <th className="pb-1">Kind</th>
            <th className="pb-1">Service</th>
            <th className="pb-1">Resolved</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.label}>
              <td className="py-0.5 font-mono">{entry.label}</td>
              <td className={entry.kind === 'server' ? 'text-emerald-700' : 'text-sky-700'}>
                {entry.kind}
              </td>
              <td>{entry.serviceMs !== undefined ? `${entry.serviceMs}ms` : '—'}</td>
              <td>{entry.resolvedAtMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  )
}
