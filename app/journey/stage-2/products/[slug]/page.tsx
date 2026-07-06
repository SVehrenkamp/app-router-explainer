// STAGE 2 — the boundary moves mid-level. The shell and product info are
// server-rendered (no client JS for them); reviews are fetched ON THE SERVER
// and carried across the boundary via HydrationBoundary, so the client cache
// starts warm; pricing/inventory remain plain client islands. Compare the
// waterfall here (islands fetch after hydration) with stage 3's streaming.
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { StageBanner } from '@/components/journey/stage-banner'
import {
  HydratedReviews,
  InventoryIsland,
  PricingIsland,
} from '@/components/journey/stage2-islands'
import { JOURNEY_STAGES } from '@/lib/journey'
import { getProductDetail, getReviews } from '@/lib/services'

export const metadata = { title: 'Journey · Stage 2' }

export default async function Stage2Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getProductDetail(slug)
  if (!result) notFound()
  const product = result.data

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['s2-reviews', slug],
    queryFn: async () => (await getReviews(slug)).data,
  })

  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[2]} />
      <article data-testid="stage2-pdp" className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
          {product.emoji}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-zinc-600">{product.description}</p>
          <PricingIsland slug={slug} />
          <InventoryIsland slug={slug} />
        </div>
        <section className="md:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <HydratedReviews slug={slug} />
          </HydrationBoundary>
        </section>
      </article>
    </div>
  )
}
