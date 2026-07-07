// STAGE 3 — the end state, composed from the SAME building blocks as the
// /store PDP (imported, not copied: this stage IS the reference
// implementation). Server-first, three independently streaming sections, and
// exactly one small client island (add to cart). Everything above the islands
// contributes zero client JS.
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { StageBanner } from '@/components/journey/stage-banner'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { InventorySkeleton, PriceSkeleton, ReviewsSkeleton } from '@/components/skeletons'
import { JOURNEY_STAGES } from '@/lib/journey'
import { getProductDetail } from '@/lib/services'
import { parseSectionSim } from '@/lib/sim-params'
import {
  InventoryBadge,
  PricingPanel,
  ReviewsSection,
} from '@/app/store/products/[slug]/sections'

export const metadata = { title: 'Journey · Stage 3' }

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Stage3Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const sim = parseSectionSim(sp)

  const result = await getProductDetail(slug, sim.products)
  if (!result) notFound()
  const product = result.data

  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[3]} />
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
          <SectionErrorBoundary
            fallback={
              <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Reviews are unavailable right now — the rest of the page is unaffected.
              </p>
            }
          >
            <Suspense fallback={<ReviewsSkeleton />}>
              <ReviewsSection slug={slug} sim={sim.reviews} />
            </Suspense>
          </SectionErrorBoundary>
        </section>
      </article>
    </div>
  )
}
