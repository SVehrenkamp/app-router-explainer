'use client'

// The course sidebar: all 12 modules, ticks for completed ones (progress is
// per-browser localStorage — spec: no accounts), greyed entries for modules
// that ship in later plans. Client component because completion is client
// state; the list itself comes from the shared registry.
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useProgress } from '@/components/learn/progress-provider'
import { MODULES } from '@/lib/curriculum'
import { moduleProgress } from '@/lib/progress'

export function CourseSidebar() {
  const pathname = usePathname()
  const { doc } = useProgress()

  return (
    <nav className="space-y-1">
      {MODULES.map((mod) => {
        const active = pathname === `/learn/${mod.slug}`
        const progress = moduleProgress(doc, mod.slug, mod.drills.length)
        if (mod.status === 'planned') {
          return (
            <div
              key={mod.slug}
              data-testid={`sidebar-module-${mod.slug}`}
              className="flex items-baseline gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400"
            >
              <span className="font-mono text-xs">{mod.number}.</span>
              <span>{mod.title}</span>
              <span className="ml-auto rounded bg-zinc-100 px-1.5 text-xs">planned</span>
            </div>
          )
        }
        return (
          <Link
            key={mod.slug}
            href={`/learn/${mod.slug}`}
            data-testid={`sidebar-module-${mod.slug}`}
            className={`flex items-baseline gap-2 rounded-lg px-3 py-2 text-sm ${
              active ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <span className="font-mono text-xs">{mod.number}.</span>
            <span>{mod.title}</span>
            {progress.complete && (
              <span
                data-testid={`module-complete-${mod.slug}`}
                className="ml-auto text-emerald-500"
              >
                ✓
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
