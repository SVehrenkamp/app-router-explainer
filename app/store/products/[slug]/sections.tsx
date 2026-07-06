// Three independently-streaming sections. Each is an async Server Component that
// awaits ONE microservice. Because each sits behind its own <Suspense>, a slow
// service delays only its own section — the getInitialProps model (slowest service
// gates the whole page) is gone.
import { XrayReport } from '@/components/xray/report'
import { formatPrice } from '@/lib/format'
import type { SimOverrides } from '@/lib/sim-params'
import { getInventory, getPricing, getReviews } from '@/lib/services'

type SectionProps = { slug: string; sim: SimOverrides }

export async function PricingPanel({ slug, sim }: SectionProps) {
  const { data, timing } = await getPricing(slug, sim)
  return (
    <div data-testid="pricing-panel" className="space-y-1">
      <XrayReport label="PricingPanel" kind="server" serviceMs={timing.ms} />
      <div className="text-2xl font-semibold">
        {formatPrice(data.priceCents)}
        {data.priceCents < data.listPriceCents && (
          <span className="ml-2 text-base text-zinc-400 line-through">
            {formatPrice(data.listPriceCents)}
          </span>
        )}
      </div>
      {data.promo && <div className="text-sm font-medium text-emerald-700">{data.promo}</div>}
    </div>
  )
}

export async function InventoryBadge({ slug, sim }: SectionProps) {
  const { data, timing } = await getInventory(slug, sim)
  return (
    <div data-testid="inventory-badge" className="text-sm">
      <XrayReport label="InventoryBadge" kind="server" serviceMs={timing.ms} />
      {data.inStock ? (
        <span className="text-emerald-700">
          In stock — {data.quantity} available at {data.warehouse}
        </span>
      ) : (
        <span className="text-red-600">Out of stock</span>
      )}
    </div>
  )
}

export async function ReviewsSection({ slug, sim }: SectionProps) {
  const { data, timing } = await getReviews(slug, sim)
  return (
    <div data-testid="reviews-section" className="space-y-3">
      <XrayReport label="ReviewsSection" kind="server" serviceMs={timing.ms} />
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
