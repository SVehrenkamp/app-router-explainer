// Pages-vs-App code comparison: two fenced code blocks from MDX rendered side
// by side. Highlighting already happened at compile time (rehype shiki), so
// this is pure layout. The labels carry the two worlds' identities: amber for
// the pages/ past, the seam palette for the app/ present.
export function CodeDiff({
  before,
  after,
  children,
}: {
  before: string
  after: string
  children?: React.ReactNode
}) {
  return (
    <div className="my-8">
      <div className="mb-2 grid grid-cols-1 gap-4 md:grid-cols-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-amber-700">
          ● {before}
        </span>
        <span className="hidden font-mono text-[11px] font-medium uppercase tracking-wider md:block">
          <span className="seam-text">● {after}</span>
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>pre]:my-0 [&>pre]:mb-0 [&>pre]:min-w-0">
        {children}
      </div>
    </div>
  )
}
