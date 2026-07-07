// Pages-vs-App code comparison: two fenced code blocks from MDX rendered side
// by side. Highlighting already happened at compile time (rehype shiki), so
// this is pure layout.
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
    <div className="my-6">
      <div className="mb-1 grid grid-cols-1 gap-4 text-xs font-semibold uppercase tracking-wide text-zinc-500 md:grid-cols-2">
        <span>{before}</span>
        <span className="hidden md:block">{after}</span>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 [&>pre]:my-0 [&>pre]:min-w-0">
        {children}
      </div>
    </div>
  )
}
