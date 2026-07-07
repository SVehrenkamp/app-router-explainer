// "What changes in Next 16" aside — the spec's visually distinct callout that
// isolates the volatile surface (caching, middleware rename) so content
// targeting 15.5 stays honest about what is about to move.
export function Next16Callout({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="my-8 max-w-[70ch] rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/60 p-5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="rounded-full bg-amber-500 px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-white">
          Next 16
        </span>
        <span className="text-sm font-semibold text-amber-900">What changes in Next 16</span>
      </div>
      <div className="text-sm leading-relaxed text-amber-950/90 [&_p]:mb-2 [&_p:last-child]:mb-0">
        {children}
      </div>
    </aside>
  )
}
