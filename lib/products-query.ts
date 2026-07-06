// ONE query definition used on BOTH sides of the hydration boundary: the server
// prefetches with it, the client hook reads it. Keeping key + fn together is
// what makes the handshake reliable.
import { infiniteQueryOptions } from '@tanstack/react-query'
import type { ProductPage } from '@/lib/types'

async function fetchProductsPage(page: number): Promise<ProductPage> {
  // Relative URL in the browser; absolute on the server (Node fetch needs a host).
  const base =
    typeof window === 'undefined'
      ? (process.env.SERVICES_BASE_URL ?? 'http://localhost:3000')
      : ''
  const res = await fetch(`${base}/api/services/products?page=${page}`)
  if (!res.ok) throw new Error(`products service responded ${res.status}`)
  return res.json()
}

export const productsQueryOptions = infiniteQueryOptions({
  queryKey: ['products'],
  queryFn: ({ pageParam }) => fetchProductsPage(pageParam),
  initialPageParam: 1,
  getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.page + 1 : undefined),
  staleTime: 60_000,
})
