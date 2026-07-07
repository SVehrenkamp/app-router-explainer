'use client'

// The course sidebar: all 12 modules, a seam progress bar for the course as a
// whole, ticks for completed modules (progress is per-browser localStorage —
// spec: no accounts). Client component because completion is client state;
// the list itself comes from the shared registry.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgress } from '@/components/learn/progress-provider'
import { MODULES } from '@/lib/curriculum'
import { moduleProgress } from '@/lib/progress'

export function CourseSidebar() {
  const pathname = usePathname()
  const { doc } = useProgress()

  const available = MODULES.filter((m) => m.status === 'available')
  const completed = available.filter(
    (m) => moduleProgress(doc, m.slug, m.drills.length).complete
  ).length

  return (
    <nav>
      <div className="mb-2 flex items-baseline justify-between px-3">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Curriculum
        </span>
        <span className="figures text-xs text-zinc-500">
          {completed}/{available.length}
        </span>
      </div>
      <div className="mx-3 mb-4 h-1 overflow-hidden rounded-full bg-zinc-200">
        <div
          className="seam h-full rounded-full transition-all duration-500"
          style={{ width: `${available.length ? (completed / available.length) * 100 : 0}%` }}
        />
      </div>
      <div className="space-y-0.5">
        {MODULES.map((mod) => {
          const active = pathname === `/learn/${mod.slug}`
          const progress = moduleProgress(doc, mod.slug, mod.drills.length)
          if (mod.status === 'planned') {
            return (
              <div
                key={mod.slug}
                data-testid={`sidebar-module-${mod.slug}`}
                className="flex items-baseline gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400"
              >
                <span className="figures text-xs">{String(mod.number).padStart(2, '0')}</span>
                <span>{mod.title}</span>
                <span className="ml-auto rounded-full bg-zinc-100 px-1.5 font-mono text-[11px]">
                  planned
                </span>
              </div>
            )
          }
          return (
            <Link
              key={mod.slug}
              href={`/learn/${mod.slug}`}
              data-testid={`sidebar-module-${mod.slug}`}
              className={`flex items-baseline gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? 'bg-zinc-900 font-medium text-white'
                  : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
              }`}
            >
              <span className={`figures text-xs ${active ? 'text-zinc-400' : 'text-zinc-400'}`}>
                {String(mod.number).padStart(2, '0')}
              </span>
              <span className="leading-snug">{mod.title}</span>
              {progress.complete && (
                <span
                  data-testid={`module-complete-${mod.slug}`}
                  className={`ml-auto ${active ? 'text-teal-300' : 'text-teal-600'}`}
                >
                  ✓
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
