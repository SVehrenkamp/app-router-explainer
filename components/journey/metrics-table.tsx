// The measured half of the dashboard. Both columns come from the committed
// journey-metrics.generated.json (real .next manifest data); the tree split is
// counted from each stage's source. Hydration cost and RSC payload are NOT
// numbers here — they get their own live labs (Plan 3) rather than estimates.
import metricsJson from '@/lib/journey-metrics.generated.json'
import type { MetricsFile } from '@/lib/journey-metrics'
import { JOURNEY_STAGES } from '@/lib/journey'

const metrics = metricsJson as MetricsFile

export function MetricsTable() {
  const byStage = new Map(metrics.measurements.map((m) => [m.stage, m]))
  return (
    <div className="overflow-x-auto">
      <table data-testid="metrics-table" className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-left text-zinc-500">
            <th className="py-2 pr-4">Stage</th>
            <th className="py-2 pr-4">Client boundary</th>
            <th className="py-2 pr-4">Page-specific JS</th>
            <th className="py-2 pr-4">Route JS total</th>
            <th className="py-2 pr-4">Tree split (server / client)</th>
          </tr>
        </thead>
        <tbody>
          {JOURNEY_STAGES.map((stage) => {
            const m = byStage.get(stage.stage)
            return (
              <tr key={stage.stage} className="border-b border-zinc-200">
                <td className="py-2 pr-4 font-medium">
                  {stage.stage} — {stage.title}
                </td>
                <td className="py-2 pr-4 text-zinc-600">{stage.boundary}</td>
                <td className="py-2 pr-4 font-mono">
                  {m?.pageKB != null ? `${m.pageKB} KB` : '—'}
                </td>
                <td className="py-2 pr-4 font-mono">
                  {m?.firstLoadKB != null ? `${m.firstLoadKB} KB` : '—'}
                </td>
                <td className="py-2 pr-4 font-mono">
                  {stage.treeSplit.server} / {stage.treeSplit.client}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-2 space-y-1 text-xs text-zinc-500">
        <p>{metrics.note} Uncompressed sizes.</p>
        <p>
          Reading the numbers honestly: <strong>route totals</strong> are dominated by each
          router&apos;s shared framework baseline (the App Router&apos;s is heavier, and this
          site ships React Query globally), so pages- and app-router totals are not directly
          comparable. <strong>Page-specific JS</strong> is what moves when the boundary moves —
          stage 2&apos;s number includes the React Query hydration machinery that stages 1 and 3
          don&apos;t ship. Watch it collapse at stage 3.
        </p>
      </div>
    </div>
  )
}
