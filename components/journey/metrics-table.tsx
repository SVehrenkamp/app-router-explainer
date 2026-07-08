// The measured half of the dashboard. Both columns come from the committed
// journey-metrics.generated.json (real .next manifest data); the tree split is
// counted from each stage's source. The inline bars make the page-specific
// story legible at a glance — and the footnotes keep the numbers honest.
import metricsJson from '@/lib/journey-metrics.generated.json'
import type { MetricsFile } from '@/lib/journey-metrics'
import { JOURNEY_STAGES } from '@/lib/journey'

const metrics = metricsJson as MetricsFile

export function MetricsTable() {
  const byStage = new Map(metrics.measurements.map((m) => [m.stage, m]))
  const maxPageKB = Math.max(...metrics.measurements.map((m) => m.pageKB ?? 0), 1)
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-xs">
      <table data-testid="metrics-table" className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-200 bg-zinc-50/60 text-left">
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Stage
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Client boundary
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Page-specific JS
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Route JS total
            </th>
            <th className="px-4 py-3 font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500">
              Tree split (server / client)
            </th>
          </tr>
        </thead>
        <tbody>
          {JOURNEY_STAGES.map((stage) => {
            const m = byStage.get(stage.stage)
            const pct = m?.pageKB != null ? Math.max((m.pageKB / maxPageKB) * 100, 4) : 0
            return (
              <tr key={stage.stage} className="border-b border-zinc-100 last:border-0">
                <td className="px-4 py-3 font-medium">
                  <span className="figures mr-2 text-zinc-400">{stage.stage}</span>
                  {stage.title}
                </td>
                <td className="px-4 py-3 text-zinc-600">{stage.boundary}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="figures whitespace-nowrap">
                      {m?.pageKB != null ? `${m.pageKB} KB` : '—'}
                    </span>
                    <span className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
                      <span className="seam block h-full rounded-full" style={{ width: `${pct}%` }} />
                    </span>
                  </div>
                </td>
                <td className="figures px-4 py-3 text-zinc-600">
                  {m?.firstLoadKB != null ? `${m.firstLoadKB} KB` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className="figures">
                    <span className="text-teal-700">{stage.treeSplit.server}</span>
                    <span className="mx-1 text-zinc-300">/</span>
                    <span className="text-indigo-600">{stage.treeSplit.client}</span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="space-y-1 border-t border-zinc-100 px-4 py-3 text-xs leading-relaxed text-zinc-500">
        <p>{metrics.note} Uncompressed sizes.</p>
        <p>
          Reading the numbers honestly: <strong className="text-zinc-600">route totals</strong> are
          dominated by each router&apos;s shared framework baseline (the App Router&apos;s is
          heavier, and this site ships React Query globally), so pages- and app-router totals are
          not directly comparable. <strong className="text-zinc-600">Page-specific JS</strong> is
          what moves when the boundary moves — stage 2&apos;s number includes the React Query
          hydration machinery that stages 1 and 3 don&apos;t ship. Watch it collapse at stage 3.
        </p>
      </div>
    </div>
  )
}
