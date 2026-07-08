// The landing page — effectively module 0: the pitch, the migration strategy
// as a dial, and the learning path. The hero's drawn seam IS the thesis: the
// server/client boundary, moved deliberately. Statically prerendered; every
// claim links to a live demo or a measured number elsewhere in the site.
import Link from 'next/link'
import { MODULES } from '@/lib/curriculum'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

const LAB_LINKS = [
  { href: '/labs/boundary-explorer', title: 'Boundary Explorer', blurb: 'Move the boundary, watch the cost' },
  { href: '/labs/cache-lab', title: 'Cache Lab', blurb: 'Hit/miss timelines, CDN lens' },
  { href: '/labs/rsc-inspector', title: 'RSC Payload Inspector', blurb: 'What crosses the wire' },
]

export default function HomePage() {
  return (
    <div className="space-y-20">
      <section className="max-w-3xl space-y-6 pt-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          A field guide in running code
        </p>
        <h1 className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-6xl">
          Master the boundary between{' '}
          <span className="whitespace-nowrap text-teal-700">server</span> and{' '}
          <span className="whitespace-nowrap text-indigo-600">client</span>
        </h1>
        <div className="seam seam-draw h-[3px] w-40 rounded-full" />
        <p className="max-w-2xl text-lg leading-relaxed text-zinc-600">
          A course for migrating our ecommerce stack — React Query, microservices, Fastly —
          from the Pages Router to the App Router. Every lesson runs on a working storefront
          inside this site; every performance claim is a number the build measured.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/learn/why-app-router"
            className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-800 hover:shadow-md"
          >
            Start module 1 →
          </Link>
          <Link
            href="/store"
            className="rounded-xl border border-zinc-300 bg-white px-6 py-3 font-medium transition hover:-translate-y-0.5 hover:shadow-sm"
          >
            Explore the demo store
          </Link>
        </div>
      </section>

      <section className="space-y-5">
        <div className="max-w-2xl space-y-2">
          <h2 className="font-display text-3xl font-bold tracking-tight">
            The strategy: push the boundary down
          </h2>
          <p className="text-zinc-600">
            Start with the client boundary at the top — everything works, nothing improves —
            then push it down in measured steps. The same product page, four real stages:
          </p>
        </div>
        <div className="relative">
          <div className="seam absolute left-0 right-0 top-1/2 hidden h-[2px] -translate-y-1/2 rounded-full opacity-30 md:block" />
          <div className="relative grid gap-3 md:grid-cols-4">
            {JOURNEY_STAGES.map((stage) => (
              <Link
                key={stage.stage}
                href={stage.pdpRoute(DEMO_SLUG)}
                className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="figures text-2xl font-semibold text-zinc-300 transition-colors group-hover:text-zinc-500">
                    {stage.stage}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${
                      stage.router === 'pages'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-50 text-indigo-700'
                    }`}
                  >
                    {stage.router}/
                  </span>
                </div>
                <div className="font-medium leading-snug">{stage.title}</div>
                <div className="mt-1 text-xs leading-relaxed text-zinc-500">{stage.boundary}</div>
              </Link>
            ))}
          </div>
        </div>
        <Link
          href="/journey"
          className="inline-block text-sm font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-4 hover:decoration-indigo-600"
        >
          Compare all four with measured bundle sizes →
        </Link>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-3xl font-bold tracking-tight">The learning path</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {MODULES.map((mod) => {
            const inner = (
              <>
                <div className="mb-2 flex items-baseline gap-2.5">
                  <span className="figures text-sm text-zinc-400">
                    {String(mod.number).padStart(2, '0')}
                  </span>
                  <span className="font-medium leading-snug">{mod.title}</span>
                  {mod.status === 'planned' && (
                    <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-500">
                      planned
                    </span>
                  )}
                </div>
                <p className="text-xs leading-relaxed text-zinc-500">{mod.summary}</p>
              </>
            )
            return mod.status === 'available' ? (
              <Link
                key={mod.slug}
                href={`/learn/${mod.slug}`}
                data-testid="path-module"
                className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={mod.slug}
                data-testid="path-module"
                className="rounded-2xl border border-dashed border-zinc-300 p-5 opacity-70"
              >
                {inner}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="font-display text-3xl font-bold tracking-tight">Labs</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {LAB_LINKS.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="font-medium">{lab.title}</div>
              <div className="mt-1 text-xs text-zinc-500">{lab.blurb}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
