// Rendered by notFound() anywhere in the app (and for unmatched URLs).
// Replaces pages/404.tsx.
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-zinc-600">That page doesn&apos;t exist — maybe the product was renamed?</p>
      <Link href="/store" className="underline">
        Back to the store
      </Link>
    </section>
  )
}
