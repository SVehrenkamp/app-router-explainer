// The streaming PDP. params/searchParams are Promises in Next 15 — await them.
// Reading searchParams opts this route into dynamic rendering, which it wants
// anyway: pricing and inventory are per-request data.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InventorySkeleton, PriceSkeleton, ReviewsSkeleton } from '@/components/skeletons'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { getProductDetail } from '@/lib/services'
import { parseSectionSim } from '@/lib/sim-params'
import { InventoryBadge, PricingPanel, ReviewsSection } from './sections'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Request memoization dedupes this with the page's own fetch (same URL, same render).
  const result = await getProductDetail(slug)
  return { title: result ? result.data.name : 'Not found' }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const sim = parseSectionSim(sp)

  const result = await getProductDetail(slug, sim.products)
  // Nuance: because an ancestor loading.tsx already flushed the shell (200),
  // notFound() here renders the 404 UI into the stream but CANNOT change the
  // HTTP status code. Bots and monitoring must key off content, not status.
  if (!result) notFound()
  const product = result.data

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
        {product.emoji}
      </div>
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-zinc-600">{product.description}</p>
        <Suspense fallback={<PriceSkeleton />}>
          <PricingPanel slug={slug} sim={sim.pricing} />
        </Suspense>
        <Suspense fallback={<InventorySkeleton />}>
          <InventoryBadge slug={slug} sim={sim.inventory} />
        </Suspense>
        <AddToCartButton slug={slug} />
      </div>
      <section className="md:col-span-2">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection slug={slug} sim={sim.reviews} />
        </Suspense>
      </section>
    </article>
  )
}
