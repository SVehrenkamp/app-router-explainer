'use client'

// STAGE 1 — the "wrap it all" migration step. The route lives in the App
// Router now (persistent layouts, loading.tsx, next/navigation are available)
// but this whole page is ONE client component and React Query still owns all
// data. Nothing about the bundle improved yet — that is the honest trade of
// stage 1, and exactly why it is the safest first step for a big codebase.
// Client components still SSR: the loading states below render on the server.
import { useQuery } from '@tanstack/react-query'
import { XrayRegion } from '@/components/xray/region'
import { fetchLegacyJson } from '@/lib/legacy-fetch'
import { formatPrice } from '@/lib/format'
import type { Inventory, Pricing, Product, ReviewSummary } from '@/lib/types'

export function Stage1PDP({ slug }: { slug: string }) {
  const product = useQuery({
    queryKey: ['s1-product', slug],
    queryFn: () => fetchLegacyJson<Product>(`/api/services/products/${slug}`),
  })
  const pricing = useQuery({
    queryKey: ['s1-pricing', slug],
    queryFn: () => fetchLegacyJson<Pricing>(`/api/services/pricing/${slug}`),
  })
  const inventory = useQuery({
    queryKey: ['s1-inventory', slug],
    queryFn: () => fetchLegacyJson<Inventory>(`/api/services/inventory/${slug}`),
  })
  const reviews = useQuery({
    queryKey: ['s1-reviews', slug],
    queryFn: () => fetchLegacyJson<ReviewSummary>(`/api/services/reviews/${slug}`),
  })

  return (
    <XrayRegion label="Stage1PDP (entire page)" kind="client">
      <article data-testid="stage1-pdp" className="grid gap-8 md:grid-cols-2">
      <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
        {product.data?.emoji ?? '…'}
      </div>
      <div className="space-y-4">
        {product.isPending ? (
          <p className="text-sm text-zinc-500">Loading product…</p>
        ) : product.data ? (
          <>
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {product.data.category}
            </div>
            <h1 className="text-3xl font-bold">{product.data.name}</h1>
            <p className="text-zinc-600">{product.data.description}</p>
          </>
        ) : (
          <p className="text-zinc-600">Product not found.</p>
        )}
        {pricing.data && (
          <div className="text-2xl font-semibold">{formatPrice(pricing.data.priceCents)}</div>
        )}
        {inventory.data && (
          <div className="text-sm">
            {inventory.data.inStock ? (
              <span className="text-emerald-700">
                In stock — {inventory.data.quantity} available
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        )}
      </div>
      <section className="md:col-span-2">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        {reviews.data ? (
          <div className="space-y-3">
            <div className="text-sm text-zinc-600">
              {reviews.data.averageRating} ★ · {reviews.data.reviews.length} reviews
            </div>
            {reviews.data.reviews.map((review) => (
              <blockquote key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="mb-1 text-sm font-medium">
                  {review.author} · {'★'.repeat(review.rating)}
                </div>
                <p className="text-sm text-zinc-600">{review.body}</p>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Loading reviews…</p>
        )}
      </section>
      </article>
    </XrayRegion>
  )
}
