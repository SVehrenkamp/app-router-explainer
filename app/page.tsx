// The landing page — effectively module 0: the pitch, the migration strategy
// in one strip, and the learning path. Statically prerendered; every claim
// links to a live demo or a measured number elsewhere in the site.
import Link from 'next/link'
import { MODULES } from '@/lib/curriculum'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

const LAB_LINKS = [
  { href: '/labs/boundary-explorer', title: 'Boundary Explorer' },
  { href: '/labs/cache-lab', title: 'Cache Lab' },
  { href: '/labs/rsc-inspector', title: 'RSC Payload Inspector' },
]

export default function HomePage() {
  return (
    <div className="space-y-14">
      <section className="max-w-3xl space-y-4">
        <h1 className="text-4xl font-bold">
          The App Router, taught on the app you actually build
        </h1>
        <p className="text-lg text-zinc-600">
          A field guide for migrating our ecommerce stack — React Query, microservices,
          Fastly — from the Pages Router to the App Router. Every lesson runs on a working
          storefront in this site; every performance claim is a number the build measured.
        </p>
        <div className="flex gap-3">
          <Link
            href="/learn/why-app-router"
            className="rounded-lg bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-700"
          >
            Start module 1 →
          </Link>
          <Link
            href="/store"
            className="rounded-lg border border-zinc-300 px-5 py-2.5 hover:bg-zinc-100"
          >
            Explore the demo store
          </Link>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">The strategy: push the boundary down</h2>
        <p className="max-w-2xl text-zinc-600">
          Start with the client boundary at the top — everything works, nothing improves —
          then push it down in measured steps. The same product page, four real stages:
        </p>
        <div className="grid gap-3 md:grid-cols-4">
          {JOURNEY_STAGES.map((stage) => (
            <Link
              key={stage.stage}
              href={stage.pdpRoute(DEMO_SLUG)}
              className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
            >
              <div className="mb-1 text-xs font-semibold text-violet-600">
                Stage {stage.stage}
              </div>
              <div className="text-sm font-medium">{stage.title}</div>
              <div className="mt-1 text-xs text-zinc-500">{stage.boundary}</div>
            </Link>
          ))}
        </div>
        <Link href="/journey" className="inline-block text-sm text-violet-700 underline">
          Compare all four with measured bundle sizes →
        </Link>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">The learning path</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {MODULES.map((mod) => {
            const inner = (
              <>
                <div className="mb-1 flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-400">
                    {String(mod.number).padStart(2, '0')}
                  </span>
                  <span className="text-sm font-medium">{mod.title}</span>
                  {mod.status === 'planned' && (
                    <span className="ml-auto rounded bg-zinc-100 px-1.5 text-xs text-zinc-500">
                      planned
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{mod.summary}</p>
              </>
            )
            return mod.status === 'available' ? (
              <Link
                key={mod.slug}
                href={`/learn/${mod.slug}`}
                data-testid="path-module"
                className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
              >
                {inner}
              </Link>
            ) : (
              <div
                key={mod.slug}
                data-testid="path-module"
                className="rounded-xl border border-dashed border-zinc-200 p-4 opacity-70"
              >
                {inner}
              </div>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold">Labs</h2>
        <div className="flex flex-wrap gap-3">
          {LAB_LINKS.map((lab) => (
            <Link
              key={lab.href}
              href={lab.href}
              className="rounded-lg border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-100"
            >
              {lab.title} →
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
