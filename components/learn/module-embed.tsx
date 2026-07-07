// The "live storefront/lab embed" slot in every module's anatomy: a bordered
// panel that frames a live demo link with context. Server component — the
// module prose around it ships zero JS, and so does this.
import Link from 'next/link'

export function ModuleEmbed({
  href,
  title,
  children,
}: {
  href: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <div className="group relative my-8 max-w-[70ch] overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs transition hover:shadow-md">
      <div className="seam h-[3px] w-full" />
      <div className="p-5">
        <div className="mb-1.5 flex items-center justify-between gap-4">
          <span className="font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500">
            Live demo
          </span>
          <Link
            href={href}
            className="shrink-0 text-sm font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-4 transition group-hover:decoration-indigo-600"
          >
            open live ↗
          </Link>
        </div>
        <div className="font-display text-lg font-semibold tracking-tight">{title}</div>
        <div className="mt-1 text-sm leading-relaxed text-zinc-600">{children}</div>
      </div>
    </div>
  )
}
