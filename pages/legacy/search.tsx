// STAGE 0 search. getInitialProps re-runs on every query change; the <form>
// is a plain GET, so submitting reloads the entire document — chrome and all.
// /store/search does the same job with a dynamically-rendered server component
// and zero custom data plumbing.
import type { NextPage, NextPageContext } from 'next'
import { LegacyShell } from '@/components/legacy-shell'
import { fetchLegacyJson, type LegacyReq } from '@/lib/legacy-fetch'
import { formatPrice } from '@/lib/format'
import type { ProductPage } from '@/lib/types'

type Props = { query: string; results: ProductPage | null }

const LegacySearchPage: NextPage<Props> = ({ query, results }) => (
  <LegacyShell title="Search">
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Search (Pages Router)</h1>
      <form method="GET" className="flex gap-2">
        <input
          type="search"
          name="q"
          defaultValue={query}
          data-testid="legacy-search-input"
          placeholder="Search products…"
          className="w-64 rounded-lg border border-zinc-300 px-3 py-2"
        />
        <button
          type="submit"
          data-testid="legacy-search-submit"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-white"
        >
          Search
        </button>
      </form>
      {results && (
        <div data-testid="legacy-search-results" className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {results.products.map((product) => (
            <a
              key={product.slug}
              href={`/legacy/products/${product.slug}`}
              className="rounded-xl border border-zinc-200 bg-white p-4"
            >
              <div className="mb-3 text-5xl">{product.emoji}</div>
              <div className="font-medium">{product.name}</div>
              <div className="text-sm text-zinc-600">{formatPrice(product.basePriceCents)}</div>
            </a>
          ))}
        </div>
      )}
    </section>
  </LegacyShell>
)

LegacySearchPage.getInitialProps = async (ctx: NextPageContext): Promise<Props> => {
  const query = typeof ctx.query.q === 'string' ? ctx.query.q.trim() : ''
  if (!query) return { query, results: null }
  const results = await fetchLegacyJson<ProductPage>(
    `/api/services/products?q=${encodeURIComponent(query)}`,
    ctx.req as LegacyReq | undefined
  )
  return { query, results }
}

export default LegacySearchPage
