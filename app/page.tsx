// Landing stub. The full landing page (learning path, curriculum links) ships in Plan 4.
import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">App Router Field Guide</h1>
      <p className="max-w-2xl text-zinc-600">
        A hands-on guide to migrating our ecommerce app from the Pages Router to the App
        Router. Start by exploring the demo store — every page in it is a working App Router
        reference implementation.
      </p>
      <Link
        href="/store"
        className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
      >
        Explore the demo store →
      </Link>
    </section>
  )
}
