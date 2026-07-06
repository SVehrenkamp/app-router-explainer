// The Boundary Journey dashboard — the site's thesis on one screen. Four REAL
// implementations of the same PDP, one per migration stage, with measured
// client-JS footprints. Push the boundary down, watch the number fall.
import Link from 'next/link'
import { CodeButton } from '@/components/code-button'
import { MetricsTable } from '@/components/journey/metrics-table'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

export const metadata = { title: 'The Boundary Journey' }

export default function JourneyPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold">The Boundary Journey</h1>
          <p className="text-zinc-600">
            The same product page at four real migration stages. Start with the client
            boundary at the top — everything works, nothing improves — then push it down
            and measure what each push buys.
          </p>
        </div>
        <CodeButton id="journey-dashboard" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {JOURNEY_STAGES.map((stage) => (
          <Link
            key={stage.stage}
            href={stage.pdpRoute(DEMO_SLUG)}
            data-testid="stage-card"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
                Stage {stage.stage}
              </span>
              <span className="font-medium">{stage.title}</span>
              <span className="ml-auto rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs">
                {stage.router}/
              </span>
            </div>
            <p className="text-sm text-zinc-600">{stage.summary}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Measured, not asserted</h2>
        <MetricsTable />
        <p className="text-sm text-zinc-600">
          Hydration cost and RSC payload size get live instruments instead of estimates —
          coming in the labs (Plan 3). Tip: add{' '}
          <code className="rounded bg-zinc-100 px-1">?delay_reviews=3000</code> to any stage
          URL and compare how each one degrades.
        </p>
      </div>
    </section>
  )
}
