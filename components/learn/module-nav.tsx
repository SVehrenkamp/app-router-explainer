// Linear course navigation: prev/next module, derived from the registry so it
// stays correct as modules ship. Server component — pure links, zero JS.
import Link from 'next/link'
import { MODULES } from '@/lib/curriculum'

export function ModuleNav({ current }: { current: string }) {
  const available = MODULES.filter((m) => m.status === 'available')
  const index = available.findIndex((m) => m.slug === current)
  if (index === -1) return null
  const prev = index > 0 ? available[index - 1] : null
  const next = index < available.length - 1 ? available[index + 1] : null

  return (
    <nav className="mt-14 border-t border-zinc-200 pt-6">
      <div className="grid gap-3 md:grid-cols-2">
        {prev ? (
          <Link
            data-testid="module-nav-prev"
            href={`/learn/${prev.slug}`}
            className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
              ← Previous · {String(prev.number).padStart(2, '0')}
            </div>
            <div className="font-medium">{prev.title}</div>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link
            data-testid="module-nav-next"
            href={`/learn/${next.slug}`}
            className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white text-right shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="seam h-[3px] w-full" />
            <div className="p-4">
              <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                Next · {String(next.number).padStart(2, '0')} →
              </div>
              <div className="font-medium">{next.title}</div>
            </div>
          </Link>
        )}
      </div>
    </nav>
  )
}
