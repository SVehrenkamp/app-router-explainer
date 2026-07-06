'use client'

// STAGE 2 client islands. Reviews read the cache seeded by the server
// prefetch (HydrationBoundary) — no client fetch on first paint. Pricing and
// inventory are still classic client-side React Query: the boundary has moved
// down, but not all the way.
import { useQuery } from '@tanstack/react-query'
import { XrayReport } from '@/components/xray/report'
import { fetchLegacyJson } from '@/lib/legacy-fetch'
import { formatPrice } from '@/lib/format'
import type { Inventory, Pricing, ReviewSummary } from '@/lib/types'

export function PricingIsland({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ['s2-pricing', slug],
    queryFn: () => fetchLegacyJson<Pricing>(`/api/services/pricing/${slug}`),
  })
  return (
    <div data-testid="s2-pricing-island" className="text-2xl font-semibold">
      <XrayReport label="PricingIsland" kind="client" />
      {data ? formatPrice(data.priceCents) : <span className="text-sm text-zinc-500">Loading price…</span>}
    </div>
  )
}

export function InventoryIsland({ slug }: { slug: string }) {
  const { data } = useQuery({
    queryKey: ['s2-inventory', slug],
    queryFn: () => fetchLegacyJson<Inventory>(`/api/services/inventory/${slug}`),
  })
  if (!data) return <span className="text-sm text-zinc-500">Checking stock…</span>
  return (
    <div className="text-sm">
      <XrayReport label="InventoryIsland" kind="client" />
      {data.inStock ? (
        <span className="text-emerald-700">In stock — {data.quantity} available</span>
      ) : (
        <span className="text-red-600">Out of stock</span>
      )}
    </div>
  )
}

export function HydratedReviews({ slug }: { slug: string }) {
  // Same key the server prefetched under — the handshake requirement.
  const { data } = useQuery({
    queryKey: ['s2-reviews', slug],
    queryFn: () => fetchLegacyJson<ReviewSummary>(`/api/services/reviews/${slug}`),
    staleTime: 60_000,
  })
  if (!data) return <p className="text-sm text-zinc-500">Loading reviews…</p>
  return (
    <div data-testid="s2-reviews" className="space-y-3">
      <XrayReport label="HydratedReviews" kind="client" />
      <div className="text-sm text-zinc-600">
        {data.averageRating} ★ · {data.reviews.length} reviews
      </div>
      {data.reviews.map((review) => (
        <blockquote key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
          <div className="mb-1 text-sm font-medium">
            {review.author} · {'★'.repeat(review.rating)}
          </div>
          <p className="text-sm text-zinc-600">{review.body}</p>
        </blockquote>
      ))}
    </div>
  )
}
