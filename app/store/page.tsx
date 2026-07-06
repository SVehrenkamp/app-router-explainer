// The PLP as a plain async Server Component: fetch on the server, render HTML.
// This is the simplest App Router data-fetching shape — what getServerSideProps
// becomes. Task 10 layers the React Query hydration pattern on top.
import { ProductCard } from '@/components/product-card'
import { getProductsPage } from '@/lib/services'

export const metadata = { title: 'Demo Store' }

export default async function StorePage() {
  const { data } = await getProductsPage()
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">All products</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3" data-testid="product-grid">
        {data.products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
