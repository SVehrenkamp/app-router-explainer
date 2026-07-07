// Boundary Explorer — spec lab §1. The interactive half of curriculum module 4:
// 'use client' marks an entry point; everything below it ships to the browser.
import { CodeButton } from '@/components/code-button'
import { BoundaryExplorer } from '@/components/labs/boundary-explorer'

export const metadata = { title: 'Boundary Explorer' }

export default function BoundaryExplorerPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">Boundary Explorer</h1>
          <p className="text-zinc-600">
            The stage-3 PDP as a component tree. Check &apos;use client&apos; on any node to move
            the boundary; the panel recomputes shipped client JS and flags exactly what breaks.
          </p>
        </div>
        <CodeButton id="lab-boundary-explorer" />
      </div>
      <BoundaryExplorer />
    </section>
  )
}
