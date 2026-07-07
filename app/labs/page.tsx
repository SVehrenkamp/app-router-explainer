// Lab index. Three instruments over the same storefront: where the client
// boundary sits, what the caches do, and what actually crosses the wire.
import Link from 'next/link'

const LABS = [
  {
    href: '/labs/boundary-explorer',
    title: 'Boundary Explorer',
    blurb:
      "Toggle 'use client' on the real PDP tree. Watch client JS grow, and watch the tool flag exactly what breaks and why.",
  },
  {
    href: '/labs/cache-lab',
    title: 'Cache Lab',
    blurb:
      'Fire requests at static, dynamic, revalidating, and tagged routes. Watch the hit/miss timeline and the headers your CDN would see.',
  },
  {
    href: '/labs/rsc-inspector',
    title: 'RSC Payload Inspector',
    blurb:
      'Fetch a route’s actual flight payload and read it annotated: tree segments, client-module references, props crossing the boundary.',
  },
]

export const metadata = { title: 'Labs' }

export default function LabsPage() {
  return (
    <section className="space-y-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Labs</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {LABS.map((lab) => (
          <Link
            key={lab.href}
            href={lab.href}
            data-testid="lab-card"
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-1 font-medium">{lab.title}</div>
            <p className="text-sm text-zinc-600">{lab.blurb}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
