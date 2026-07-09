// STAGE 0 — the PDP as the team's app works today. getInitialProps fetches
// product + pricing + inventory in one Promise.all: the page renders NOTHING
// until the SLOWEST service answers (pricing: 800ms default). Reviews use
// React Query with no SSR — the "minimal SSR" pattern (bots get product info,
// humans get reviews after hydration). Every byte of this page ships to the
// client and hydrates. Compare /journey/stage-3/products/[slug].
import type { NextPage, NextPageContext } from 'next'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { LegacyShell } from '@/components/legacy-shell'
import { JOURNEY_STAGES } from '@/lib/journey'
import { fetchLegacyJson, type LegacyReq } from '@/lib/legacy-fetch'
import { formatPrice } from '@/lib/format'
import type { Inventory, Pricing, Product, ReviewSummary } from '@/lib/types'

type Props = { product: Product | null; pricing: Pricing | null; inventory: Inventory | null }

const LegacyProductPage: NextPage<Props> = ({ product, pricing, inventory }) => {
  const { data: reviews, isPending } = useQuery({
    queryKey: ['legacy-reviews', product?.slug],
    queryFn: () => fetchLegacyJson<ReviewSummary>(`/api/services/reviews/${product?.slug}`),
    enabled: Boolean(product),
  })

  if (!product) {
    return (
      <LegacyShell title="Not found">
        <p className="text-zinc-600">Product not found.</p>
      </LegacyShell>
    )
  }

  return (
    <LegacyShell title={product.name}>
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-amber-300 bg-amber-100/60 px-4 py-2.5 text-sm text-amber-900">
        <span>
          This is <strong>stage 0</strong> of the Boundary Journey — the app as it works today.
        </span>
        <Link
          data-testid="legacy-advance"
          href={JOURNEY_STAGES[1].pdpRoute(product.slug)}
          className="ml-auto rounded-lg bg-amber-900 px-3 py-1 font-mono text-xs font-semibold text-amber-50 transition hover:bg-amber-800"
        >
          advance to stage 1 →
        </Link>
      </div>
      <article data-testid="legacy-pdp" className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
          {product.emoji}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-zinc-600">{product.description}</p>
          {pricing && (
            <div data-testid="legacy-price" className="text-2xl font-semibold">
              {formatPrice(pricing.priceCents)}
              {pricing.promo && (
                <span className="ml-2 text-sm font-medium text-emerald-700">{pricing.promo}</span>
              )}
            </div>
          )}
          {inventory && (
            <div className="text-sm">
              {inventory.inStock ? (
                <span className="text-emerald-700">In stock — {inventory.quantity} available</span>
              ) : (
                <span className="text-red-600">Out of stock</span>
              )}
            </div>
          )}
        </div>
        <section className="md:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
          {isPending || !reviews ? (
            <p className="text-sm text-zinc-500">Loading reviews…</p>
          ) : (
            <div data-testid="legacy-reviews" className="space-y-3">
              <div className="text-sm text-zinc-600">
                {reviews.averageRating} ★ · {reviews.reviews.length} reviews
              </div>
              {reviews.reviews.map((review) => (
                <blockquote key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                  <div className="mb-1 text-sm font-medium">
                    {review.author} · {'★'.repeat(review.rating)}
                  </div>
                  <p className="text-sm text-zinc-600">{review.body}</p>
                </blockquote>
              ))}
            </div>
          )}
        </section>
      </article>
    </LegacyShell>
  )
}

LegacyProductPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const slug = typeof ctx.query.slug === 'string' ? ctx.query.slug : ''
  const req = ctx.req as LegacyReq | undefined
  try {
    // The stage-0 waterfall dam: one Promise.all, page blocked until ALL resolve.
    const [product, pricing, inventory] = await Promise.all([
      fetchLegacyJson<Product>(`/api/services/products/${slug}`, req),
      fetchLegacyJson<Pricing>(`/api/services/pricing/${slug}`, req),
      fetchLegacyJson<Inventory>(`/api/services/inventory/${slug}`, req),
    ])
    return { product, pricing, inventory }
  } catch {
    return { product: null, pricing: null, inventory: null }
  }
}

export default LegacyProductPage
