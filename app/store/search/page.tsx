// Reading searchParams makes this route dynamically rendered — the App Router
// equivalent of a getServerSideProps page keyed on query.
import { ProductCard } from '@/components/product-card'
import { SearchBox } from '@/components/search-box'
import { getProductsPage } from '@/lib/services'

export const metadata = { title: 'Search' }

type Props = { searchParams: Promise<{ q?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams
  const query = q?.trim()
  const results = query ? (await getProductsPage({ query })).data.products : null

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Search</h1>
      <SearchBox defaultValue={query} />
      {results === null ? (
        <p className="text-zinc-600">Type a query to search the catalog.</p>
      ) : results.length === 0 ? (
        <p className="text-zinc-600">No products match "{query}".</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {results.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
