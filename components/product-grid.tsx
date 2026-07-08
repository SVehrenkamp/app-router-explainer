'use client'

// Client side of the hydration handshake. useSuspenseInfiniteQuery reads the
// cache the server dehydrated — no refetch, no loading flash — then
// fetchNextPage takes over for client-side pagination. This is the pattern for
// keeping React Query working through the migration.
//
// Nuance: ProductCard has no 'use client', but importing it FROM a client file
// compiles it into the client bundle. 'use client' marks a boundary, not a badge
// every client-rendered file needs.
import { useSuspenseInfiniteQuery } from '@tanstack/react-query'
import { XrayRegion } from '@/components/xray/region'
import { ProductCard } from '@/components/product-card'
import { productsQueryOptions } from '@/lib/products-query'

export function ProductGrid() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(productsQueryOptions)
  const products = data.pages.flatMap((page) => page.products)

  return (
    <XrayRegion label="ProductGrid" kind="client">
      <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" data-testid="product-grid">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          data-testid="load-more"
          className="rounded-lg border border-zinc-300 px-4 py-2 hover:bg-white disabled:opacity-50"
        >
          {isFetchingNextPage ? 'Loading…' : 'Load more'}
        </button>
      )}
      </div>
    </XrayRegion>
  )
}
