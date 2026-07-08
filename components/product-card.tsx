// Server component — renders to HTML on the server, contributes ZERO client JS.
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/store/products/${product.slug}`}
      data-testid="product-card"
      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="mb-3 text-5xl">{product.emoji}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-zinc-600">{formatPrice(product.basePriceCents)}</div>
    </Link>
  )
}
