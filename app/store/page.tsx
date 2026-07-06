// The PLP demonstrating React Query coexistence (spec module 6):
//   1. A request-scoped QueryClient prefetches page 1 ON THE SERVER.
//   2. dehydrate() serializes the cache; HydrationBoundary carries it across
//      the server→client boundary as a prop.
//   3. The client ProductGrid reads it via useSuspenseInfiniteQuery — SSR HTML
//      on first paint, zero duplicate fetch — then paginates client-side.
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { ProductGrid } from '@/components/product-grid'
import { CodeButton } from '@/components/code-button'
import { productsQueryOptions } from '@/lib/products-query'
import { listProducts } from '@/lib/catalog'

export const metadata = { title: 'Demo Store' }

export default async function StorePage() {
  const queryClient = new QueryClient()
  // Same queryKey as the client hook, but the server prefetch reads the
  // catalog in-process: this page is statically prerendered, and `next build`
  // has no server to answer an HTTP self-fetch of /api/services/products.
  // The browser side of the handshake still paginates over the wire.
  await queryClient.prefetchInfiniteQuery({
    ...productsQueryOptions,
    queryFn: ({ pageParam }) => listProducts({ page: Number(pageParam) }),
  })

  return (
    <section>
      <div className="flex items-center justify-between">
        <h1 className="mb-4 text-2xl font-semibold">All products</h1>
        <CodeButton id="store-plp" />
      </div>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductGrid />
      </HydrationBoundary>
    </section>
  )
}
