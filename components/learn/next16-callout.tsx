// "What changes in Next 16" aside — the spec's visually distinct callout that
// isolates the volatile surface (caching, middleware rename) so content
// targeting 15.5 stays honest about what is about to move.
export function Next16Callout({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="my-6 rounded-xl border border-amber-300 bg-amber-50 p-4">
      <div className="mb-1 text-sm font-semibold text-amber-900">What changes in Next 16</div>
      <div className="text-sm text-amber-900/90 [&_p]:mb-2 [&_p:last-child]:mb-0">{children}</div>
    </aside>
  )
}
