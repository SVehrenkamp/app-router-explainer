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
    <div className="my-6 rounded-xl border border-violet-200 bg-violet-50/50 p-4">
      <div className="mb-1 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-violet-900">{title}</span>
        <Link href={href} className="shrink-0 text-sm font-medium text-violet-700 underline">
          open live ↗
        </Link>
      </div>
      <div className="text-sm text-zinc-600">{children}</div>
    </div>
  )
}
