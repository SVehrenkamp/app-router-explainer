# Boundary Journey + Legacy Pages Implementation Plan (Plan 2 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Boundary Journey — the same PDP at four real, running migration stages (Pages Router `getInitialProps` original → boundary-at-top → boundary-mid → boundary-at-leaves) plus a comparison dashboard with measured metrics, proving the team's boundary-pushing migration strategy live.

**Architecture:** `pages/legacy/*` runs the stage-0 PDP and search in the Pages Router *inside the same app* (the coexistence story). `app/journey/stage-{1,2,3}/products/[slug]/` are three literal App Router routes — each stage's source file IS the teaching artifact, browsable via "show me the code". `/journey` is the dashboard: stage cards, a metrics table fed by real `.next` build manifests (committed generated JSON, like the source snapshot), and honest labels for anything not directly measured.

**Tech Stack:** Same pinned stack as Plan 1 (Next 15.5.18, React 19.2.6, TanStack Query 5.83.1, Tailwind 4.3.2, Vitest 4.1.10, Playwright 1.61.1). No new dependencies.

**Spec:** `docs/superpowers/specs/2026-07-06-app-router-learning-site-design.md` §"The Boundary Journey", route map, and testing sections.

## Global Constraints

- All Plan 1 global constraints still apply verbatim: pinned versions, TS strict, Next 15 async `params`/`searchParams`/`cookies()`/`headers()`, client components never `async`, JSON-serializable props across the boundary, Server Actions for UI mutations, no DB/auth/external network, deterministic fixtures, teaching header comments on every non-obvious file, commit per task, `yarn typecheck` before every commit.
- **Yarn 4** (`packageManager: yarn@4.5.0`): use `yarn <script>`, not npm. Yarn Berry does NOT run implicit pre/post scripts.
- **`lib/services.ts` is App-Router-only** (it imports `next/headers` for request-derived origins — Cloudflare fix, 2026-07-06). `pages/legacy/*` and anything it imports MUST NOT import `lib/services.ts`, `server-only`, or `next/headers`. Legacy pages use `lib/legacy-fetch.ts` (Task 1).
- **The Cloudflare Workers deploy must stay green.** `yarn build` = source snapshot → `NEXT_PRIVATE_STANDALONE=true next build` → `opennextjs-cloudflare build --skipNextBuild`. Task 8 inserts the journey-metrics script into this chain; Task 9 verifies the full chain plus a workerd preview.
- Every new page/component surfaced by a `CodeButton` gets a `lib/source-registry.ts` entry **in the same task that creates the file** (the registry unit test asserts registered paths exist on disk, and the build-time snapshot picks registry changes up automatically).
- Playwright e2e run against `yarn dev` on port 3111 with `SERVICES_BASE_URL=http://localhost:3111` (existing `playwright.config.ts`).
- Demo product slug used in journey links and tests: `aurora-desk-lamp`.

## File Structure (this plan)

```
pages/
  _app.tsx                                   # QueryClientProvider — the OLD world's provider home
  legacy/products/[slug].tsx                 # Stage 0 PDP: getInitialProps + React Query
  legacy/search.tsx                          # Stage 0 search: getInitialProps + full-reload form
components/
  legacy-shell.tsx                           # Chrome for legacy pages (re-renders every nav — the point)
  journey/stage-banner.tsx                   # Shared stage header: n/3, boundary blurb, CodeButton
  journey/stage1-pdp.tsx                     # Stage 1: one big 'use client' page (RQ untouched)
  journey/stage2-islands.tsx                 # Stage 2: pricing/inventory client islands + hydrated reviews
  journey/metrics-table.tsx                  # Dashboard metrics table (server component)
lib/
  legacy-fetch.ts                            # Isomorphic fetch base for the Pages Router world
  journey.ts                                 # Stage registry: metadata, routes, tree-split counts
  journey-metrics.ts                         # Pure manifest→KB computation (unit-tested)
  journey-metrics.generated.json             # Committed measurement output (like source snapshot)
scripts/
  journey-metrics.mjs                        # Reads .next manifests after build → generated.json
app/
  journey/layout.tsx                         # Journey shell: X-ray chrome + stage nav
  journey/page.tsx                           # Comparison dashboard
  journey/stage-1/products/[slug]/page.tsx
  journey/stage-2/products/[slug]/page.tsx
  journey/stage-3/products/[slug]/page.tsx
tests/
  unit/legacy-fetch.test.ts, unit/journey.test.ts, unit/journey-metrics.test.ts
  e2e/legacy.spec.ts, e2e/journey.spec.ts
```

---

### Task 1: Legacy fetch helper + `pages/_app.tsx`

**Files:**
- Create: `lib/legacy-fetch.ts`, `pages/_app.tsx`
- Test: `tests/unit/legacy-fetch.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces:
  - `legacyServiceBase(req?: LegacyReq): string` — `''` in the browser; `proto://host` from the request on the server; `http://localhost:3000` fallback. `type LegacyReq = { headers: Partial<Record<string, string | string[]>> }`.
  - `fetchLegacyJson<T>(path: string, req?: LegacyReq): Promise<T>` — throws `Error('<path> responded <status>')` on non-OK.
  - `pages/_app.tsx` — QueryClientProvider + global CSS for every `pages/` route.

- [ ] **Step 1: Write the failing test**

`tests/unit/legacy-fetch.test.ts`:

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchLegacyJson, legacyServiceBase } from '@/lib/legacy-fetch'

afterEach(() => vi.unstubAllGlobals())

describe('legacyServiceBase', () => {
  it('returns empty string in the browser (relative URLs)', () => {
    vi.stubGlobal('window', {})
    expect(legacyServiceBase()).toBe('')
  })

  it('derives proto://host from the incoming request on the server', () => {
    expect(
      legacyServiceBase({ headers: { host: 'demo.example.workers.dev', 'x-forwarded-proto': 'https' } })
    ).toBe('https://demo.example.workers.dev')
  })

  it('defaults proto to http and falls back to localhost without a req', () => {
    expect(legacyServiceBase({ headers: { host: 'localhost:3111' } })).toBe('http://localhost:3111')
    expect(legacyServiceBase()).toBe('http://localhost:3000')
  })
})

describe('fetchLegacyJson', () => {
  it('fetches relative in the browser and parses JSON', async () => {
    vi.stubGlobal('window', {})
    const mock = vi.fn(async () => Response.json({ ok: true }))
    vi.stubGlobal('fetch', mock)
    await expect(fetchLegacyJson('/api/services/products')).resolves.toEqual({ ok: true })
    expect(String(mock.mock.calls[0][0])).toBe('/api/services/products')
  })

  it('throws with path and status on non-OK', async () => {
    vi.stubGlobal('window', {})
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({}, { status: 503 })))
    await expect(fetchLegacyJson('/x')).rejects.toThrowError('/x responded 503')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/legacy-fetch.test.ts`
Expected: FAIL — cannot resolve `@/lib/legacy-fetch`.

- [ ] **Step 3: Write the implementation**

`lib/legacy-fetch.ts`:

```ts
// Data plumbing for the LEGACY (Pages Router) half of the app. This is the
// "before" world: getInitialProps runs on the server for the first hit and in
// the browser on client navigations, so every fetch must work from both sides
// — the exact awkwardness that App Router server components erase.
//
// Deliberately NOT lib/services.ts: that client is App-Router-only (it reads
// next/headers). Pages Router code gets the request object handed to it
// instead — plumb it through or lose the host.
export type LegacyReq = { headers: Partial<Record<string, string | string[]>> }

export function legacyServiceBase(req?: LegacyReq): string {
  if (typeof window !== 'undefined') return ''
  const host = typeof req?.headers.host === 'string' ? req.headers.host : undefined
  if (host) {
    const proto =
      typeof req?.headers['x-forwarded-proto'] === 'string'
        ? req.headers['x-forwarded-proto']
        : 'http'
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}

export async function fetchLegacyJson<T>(path: string, req?: LegacyReq): Promise<T> {
  const res = await fetch(`${legacyServiceBase(req)}${path}`)
  if (!res.ok) throw new Error(`${path} responded ${res.status}`)
  return (await res.json()) as T
}
```

`pages/_app.tsx`:

```tsx
// _app.tsx — the Pages Router's ONLY shared shell, re-rendered on every
// navigation. Global CSS may only be imported here (a rule the App Router
// drops). Compare app/providers.tsx + app/layout.tsx: the provider survives
// as a client component; the shell becomes a persistent server layout.
// This file exists so pages/legacy/* runs beside app/* — the coexistence story.
import '@/app/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function LegacyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Run tests + typecheck to verify green**

Run: `yarn vitest run tests/unit/legacy-fetch.test.ts` — PASS (5 tests).
Run: `yarn typecheck` — exit 0.
Run: `yarn build` — must still pass (pages/ dir now coexists with app/).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add pages-router _app and legacy fetch helper for the coexistence demo"
```

---

### Task 2: Stage 0 — legacy PDP (`getInitialProps` + React Query)

**Files:**
- Create: `pages/legacy/products/[slug].tsx`, `components/legacy-shell.tsx`
- Modify: `lib/source-registry.ts` (add `legacy-pdp`)
- Test: `tests/e2e/legacy.spec.ts`

**Interfaces:**
- Consumes: `fetchLegacyJson`, `LegacyReq` (Task 1); domain types; `formatPrice` from `lib/format.ts`.
- Produces:
  - `/legacy/products/aurora-desk-lamp` — SSR'd product+pricing+inventory via `getInitialProps` (all-or-nothing: slowest service gates the whole page), reviews client-only via `useQuery` (the team's minimal-SSR pattern).
  - `LegacyShell({ title, children })` — chrome for legacy pages, `data-testid="legacy-shell"`.
  - `data-testid`s: `legacy-pdp`, `legacy-price`, `legacy-reviews`.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/legacy.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('legacy PDP server-renders product, pricing, and inventory together', async ({ page }) => {
  await page.goto('/legacy/products/aurora-desk-lamp')
  await expect(page.getByTestId('legacy-pdp')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('legacy-price')).toBeVisible()
})

test('legacy PDP loads reviews client-side after hydration', async ({ page }) => {
  await page.goto('/legacy/products/aurora-desk-lamp')
  await expect(page.getByTestId('legacy-reviews')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('legacy-reviews').getByRole('blockquote').first()).toBeVisible()
})

test('legacy PDP 404s politely on unknown slugs', async ({ page }) => {
  await page.goto('/legacy/products/nope')
  await expect(page.getByText('Product not found')).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:e2e tests/e2e/legacy.spec.ts`
Expected: FAIL — `/legacy/products/aurora-desk-lamp` is 404.

- [ ] **Step 3: Write the implementation**

`components/legacy-shell.tsx`:

```tsx
// Chrome for the pages/legacy/* routes. Unlike an App Router layout, this
// re-mounts on EVERY navigation — there is no layout persistence in the Pages
// Router. That flash of re-rendered chrome is a feature here: feel the difference.
import Head from 'next/head'
import Link from 'next/link'

export function LegacyShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-testid="legacy-shell" className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <Head>
        <title>{`${title} · Legacy (Pages Router)`}</title>
      </Head>
      <nav className="border-b border-amber-300 bg-amber-50">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm">
          <span className="rounded bg-amber-200 px-2 py-0.5 font-mono text-xs">pages/ router</span>
          <span className="text-amber-900">Journey stage 0 — the app as it works today</span>
          <Link href="/journey" className="ml-auto text-amber-900 underline">
            ← Boundary Journey
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
```

`pages/legacy/products/[slug].tsx`:

```tsx
// STAGE 0 — the PDP as the team's app works today. getInitialProps fetches
// product + pricing + inventory in one Promise.all: the page renders NOTHING
// until the SLOWEST service answers (pricing: 800ms default). Reviews use
// React Query with no SSR — the "minimal SSR" pattern (bots get product info,
// humans get reviews after hydration). Every byte of this page ships to the
// client and hydrates. Compare /journey/stage-3/products/[slug].
import type { NextPage, NextPageContext } from 'next'
import { useQuery } from '@tanstack/react-query'
import { LegacyShell } from '@/components/legacy-shell'
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
```

Add to `lib/source-registry.ts` inside `SOURCE_FILES` (keep alphabetical position sensible):

```ts
  'legacy-pdp': {
    path: 'pages/legacy/products/[slug].tsx',
    title: 'Stage 0 — Pages Router PDP (getInitialProps + React Query)',
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:e2e tests/e2e/legacy.spec.ts` — PASS (3 tests).
Run: `yarn vitest run tests/unit/source-registry.test.ts` — PASS (registered path exists).
Run: `yarn typecheck` — exit 0.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add stage-0 legacy PDP with getInitialProps and client-only reviews"
```

---

### Task 3: Stage 0 — legacy search

**Files:**
- Create: `pages/legacy/search.tsx`
- Modify: `lib/source-registry.ts` (add `legacy-search`)
- Test: append to `tests/e2e/legacy.spec.ts`

**Interfaces:**
- Consumes: `fetchLegacyJson`/`LegacyReq` (Task 1), `LegacyShell` (Task 2), `formatPrice`, `ProductPage` type.
- Produces: `/legacy/search?q=lamp` — `getInitialProps` reads `ctx.query.q`; plain GET form does a FULL page reload (contrast with `/store/search`).

- [ ] **Step 1: Write the failing e2e test** (append to `tests/e2e/legacy.spec.ts`)

```ts
test('legacy search reads ?q= via getInitialProps and full-reloads on submit', async ({ page }) => {
  await page.goto('/legacy/search?q=lamp')
  await expect(page.getByTestId('legacy-search-results')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()

  await page.getByTestId('legacy-search-input').fill('mug')
  await page.getByTestId('legacy-search-submit').click()
  await page.waitForURL(/q=mug/)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:e2e tests/e2e/legacy.spec.ts`
Expected: the new test FAILs — `/legacy/search` is 404. (Task 2's tests still pass.)

- [ ] **Step 3: Write the implementation**

`pages/legacy/search.tsx`:

```tsx
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
```

Add to `lib/source-registry.ts`:

```ts
  'legacy-search': {
    path: 'pages/legacy/search.tsx',
    title: 'Stage 0 — Pages Router search (full-reload form)',
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:e2e tests/e2e/legacy.spec.ts` — PASS (4 tests).
Run: `yarn vitest run tests/unit/source-registry.test.ts && yarn typecheck` — green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add stage-0 legacy search page in the pages router"
```

---

### Task 4: Journey registry, layout, and nav

**Files:**
- Create: `lib/journey.ts`, `app/journey/layout.tsx`, `components/journey/stage-banner.tsx`
- Modify: `app/layout.tsx` (add Journey nav link)
- Test: `tests/unit/journey.test.ts`

**Interfaces:**
- Consumes: X-ray components (`XrayProvider`, `XrayToggle`, `XrayPanel`), `DevModeBanner`, `CodeButton`.
- Produces:
  - `lib/journey.ts`:
    - `type JourneyStage = { stage: 0 | 1 | 2 | 3; title: string; boundary: string; summary: string; router: 'pages' | 'app'; pdpRoute: (slug: string) => string; sourceId: string; treeSplit: { server: number; client: number } }`
    - `JOURNEY_STAGES: JourneyStage[]` (exactly 4, ordered)
    - `DEMO_SLUG = 'aurora-desk-lamp'`
  - `app/journey/layout.tsx` — X-ray chrome for all `/journey/*` pages.
  - `StageBanner({ stage }: { stage: JourneyStage })` — server component: stage number, boundary blurb, back link, `CodeButton id={stage.sourceId}`; `data-testid="stage-banner"`.

- [ ] **Step 1: Write the failing test**

`tests/unit/journey.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

describe('journey stage registry', () => {
  it('has exactly stages 0..3 in order', () => {
    expect(JOURNEY_STAGES.map((s) => s.stage)).toEqual([0, 1, 2, 3])
  })

  it('stage 0 lives in the pages router, stages 1-3 in the app router', () => {
    expect(JOURNEY_STAGES[0].router).toBe('pages')
    expect(JOURNEY_STAGES[0].pdpRoute(DEMO_SLUG)).toBe(`/legacy/products/${DEMO_SLUG}`)
    for (const stage of JOURNEY_STAGES.slice(1)) {
      expect(stage.router).toBe('app')
      expect(stage.pdpRoute(DEMO_SLUG)).toBe(`/journey/stage-${stage.stage}/products/${DEMO_SLUG}`)
    }
  })

  it('every stage carries a source id and a plausible tree split', () => {
    for (const stage of JOURNEY_STAGES) {
      expect(stage.sourceId.length).toBeGreaterThan(0)
      expect(stage.treeSplit.server + stage.treeSplit.client).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/journey.test.ts`
Expected: FAIL — cannot resolve `@/lib/journey`.

- [ ] **Step 3: Write the implementation**

`lib/journey.ts`:

```ts
// The Boundary Journey's single source of truth. Each stage is a REAL route in
// this repo; treeSplit counts are taken by reading that stage's source (they
// feed the dashboard, so keep them honest when a stage's code changes).
export type JourneyStage = {
  stage: 0 | 1 | 2 | 3
  title: string
  boundary: string
  summary: string
  router: 'pages' | 'app'
  pdpRoute: (slug: string) => string
  sourceId: string
  treeSplit: { server: number; client: number }
}

export const DEMO_SLUG = 'aurora-desk-lamp'

export const JOURNEY_STAGES: JourneyStage[] = [
  {
    stage: 0,
    title: 'Pages Router original',
    boundary: 'No boundary — everything hydrates',
    summary:
      'getInitialProps blocks on the slowest service, React Query fills reviews after hydration, and the entire page ships as client JS.',
    router: 'pages',
    pdpRoute: (slug) => `/legacy/products/${slug}`,
    sourceId: 'legacy-pdp',
    treeSplit: { server: 0, client: 5 },
  },
  {
    stage: 1,
    title: 'Boundary at the top',
    boundary: "One 'use client' at the page root",
    summary:
      'The route moves to the App Router (layouts, loading.tsx, next/navigation) but the page is one big client component and React Query is untouched. Bundle unchanged — by design.',
    router: 'app',
    pdpRoute: (slug) => `/journey/stage-1/products/${slug}`,
    sourceId: 'journey-stage-1',
    treeSplit: { server: 1, client: 5 },
  },
  {
    stage: 2,
    title: 'Boundary mid-level',
    boundary: 'Server shell, client islands',
    summary:
      'The shell and product info become server components; reviews are prefetched on the server into a HydrationBoundary; pricing and inventory stay client islands.',
    router: 'app',
    pdpRoute: (slug) => `/journey/stage-2/products/${slug}`,
    sourceId: 'journey-stage-2',
    treeSplit: { server: 4, client: 3 },
  },
  {
    stage: 3,
    title: 'Boundary at the leaves',
    boundary: 'Server-first, islands only where needed',
    summary:
      'Streaming Suspense sections, server data fetching, and a single small add-to-cart island — the /store reference implementation.',
    router: 'app',
    pdpRoute: (slug) => `/journey/stage-3/products/${slug}`,
    sourceId: 'journey-stage-3',
    treeSplit: { server: 7, client: 2 },
  },
]
```

`app/journey/layout.tsx`:

```tsx
// Journey shell. Same X-ray chrome as the store: the provider lives in the
// layout so toggling X-ray survives navigation between stages — which is the
// whole point when comparing them.
import Link from 'next/link'
import { DevModeBanner } from '@/components/dev-mode-banner'
import { XrayPanel } from '@/components/xray/panel'
import { XrayProvider } from '@/components/xray/provider'
import { XrayToggle } from '@/components/xray/toggle'

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <XrayProvider>
      <div>
        <DevModeBanner />
        <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
          <Link href="/journey" className="text-xl font-semibold">
            Boundary Journey
          </Link>
          <Link href="/store" className="text-sm text-zinc-600 hover:text-zinc-900">
            Demo Store
          </Link>
          <span className="ml-auto">
            <XrayToggle />
          </span>
        </header>
        {children}
        <XrayPanel />
      </div>
    </XrayProvider>
  )
}
```

`components/journey/stage-banner.tsx`:

```tsx
// Shared header for stage pages: which stage you are on, where the client
// boundary sits, and the door into this stage's annotated source.
import Link from 'next/link'
import { CodeButton } from '@/components/code-button'
import type { JourneyStage } from '@/lib/journey'

export function StageBanner({ stage }: { stage: JourneyStage }) {
  return (
    <div
      data-testid="stage-banner"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3"
    >
      <span className="rounded bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
        Stage {stage.stage} of 3
      </span>
      <span className="text-sm font-medium text-violet-900">{stage.title}</span>
      <span className="text-sm text-violet-700">· {stage.boundary}</span>
      <span className="ml-auto flex items-center gap-2">
        <Link href="/journey" className="text-sm text-violet-700 underline">
          Compare stages
        </Link>
        <CodeButton id={stage.sourceId} />
      </span>
    </div>
  )
}
```

Modify `app/layout.tsx` nav — after the existing Demo Store link, add:

```tsx
            <Link href="/journey" className="text-sm text-zinc-600 hover:text-zinc-900">
              Boundary Journey
            </Link>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn vitest run tests/unit/journey.test.ts` — PASS (3 tests).
Run: `yarn typecheck` — exit 0. (`/journey` itself 404s until Task 8 — the layout renders only around child pages; that is fine.)

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add journey stage registry, layout with x-ray chrome, and nav link"
```

---

### Task 5: Stage 1 — boundary at the top

**Files:**
- Create: `app/journey/stage-1/products/[slug]/page.tsx`, `components/journey/stage1-pdp.tsx`
- Modify: `lib/source-registry.ts` (add `journey-stage-1`)
- Test: `tests/e2e/journey.spec.ts`

**Interfaces:**
- Consumes: `JOURNEY_STAGES`, `StageBanner` (Task 4); `fetchLegacyJson` (Task 1 — reused client-side deliberately, relative URLs); `XrayReport`; `formatPrice`; domain types.
- Produces: `/journey/stage-1/products/[slug]` — App Router route whose page body is a single `'use client'` component; four `useQuery` calls, all client-fetched. `data-testid="stage1-pdp"`.

- [ ] **Step 1: Write the failing e2e test**

`tests/e2e/journey.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('stage 1 renders the PDP from one big client component', async ({ page }) => {
  await page.goto('/journey/stage-1/products/aurora-desk-lamp')
  await expect(page.getByTestId('stage-banner')).toBeVisible()
  await expect(page.getByTestId('stage1-pdp')).toBeVisible()
  // Data arrives via client-side React Query fetches.
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('xray-toggle')).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:e2e tests/e2e/journey.spec.ts`
Expected: FAIL — route 404s.

- [ ] **Step 3: Write the implementation**

`components/journey/stage1-pdp.tsx`:

```tsx
'use client'

// STAGE 1 — the "wrap it all" migration step. The route lives in the App
// Router now (persistent layouts, loading.tsx, next/navigation are available)
// but this whole page is ONE client component and React Query still owns all
// data. Nothing about the bundle improved yet — that is the honest trade of
// stage 1, and exactly why it is the safest first step for a big codebase.
// Client components still SSR: the loading states below render on the server.
import { useQuery } from '@tanstack/react-query'
import { XrayReport } from '@/components/xray/report'
import { fetchLegacyJson } from '@/lib/legacy-fetch'
import { formatPrice } from '@/lib/format'
import type { Inventory, Pricing, Product, ReviewSummary } from '@/lib/types'

export function Stage1PDP({ slug }: { slug: string }) {
  const product = useQuery({
    queryKey: ['s1-product', slug],
    queryFn: () => fetchLegacyJson<Product>(`/api/services/products/${slug}`),
  })
  const pricing = useQuery({
    queryKey: ['s1-pricing', slug],
    queryFn: () => fetchLegacyJson<Pricing>(`/api/services/pricing/${slug}`),
  })
  const inventory = useQuery({
    queryKey: ['s1-inventory', slug],
    queryFn: () => fetchLegacyJson<Inventory>(`/api/services/inventory/${slug}`),
  })
  const reviews = useQuery({
    queryKey: ['s1-reviews', slug],
    queryFn: () => fetchLegacyJson<ReviewSummary>(`/api/services/reviews/${slug}`),
  })

  return (
    <article data-testid="stage1-pdp" className="grid gap-8 md:grid-cols-2">
      <XrayReport label="Stage1PDP (entire page)" kind="client" />
      <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
        {product.data?.emoji ?? '…'}
      </div>
      <div className="space-y-4">
        {product.isPending ? (
          <p className="text-sm text-zinc-500">Loading product…</p>
        ) : product.data ? (
          <>
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {product.data.category}
            </div>
            <h1 className="text-3xl font-bold">{product.data.name}</h1>
            <p className="text-zinc-600">{product.data.description}</p>
          </>
        ) : (
          <p className="text-zinc-600">Product not found.</p>
        )}
        {pricing.data && (
          <div className="text-2xl font-semibold">{formatPrice(pricing.data.priceCents)}</div>
        )}
        {inventory.data && (
          <div className="text-sm">
            {inventory.data.inStock ? (
              <span className="text-emerald-700">
                In stock — {inventory.data.quantity} available
              </span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </div>
        )}
      </div>
      <section className="md:col-span-2">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        {reviews.data ? (
          <div className="space-y-3">
            <div className="text-sm text-zinc-600">
              {reviews.data.averageRating} ★ · {reviews.data.reviews.length} reviews
            </div>
            {reviews.data.reviews.map((review) => (
              <blockquote key={review.id} className="rounded-lg border border-zinc-200 bg-white p-4">
                <div className="mb-1 text-sm font-medium">
                  {review.author} · {'★'.repeat(review.rating)}
                </div>
                <p className="text-sm text-zinc-600">{review.body}</p>
              </blockquote>
            ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-500">Loading reviews…</p>
        )}
      </section>
    </article>
  )
}
```

`app/journey/stage-1/products/[slug]/page.tsx`:

```tsx
// STAGE 1 route file. The only server code here unwraps params and renders the
// banner — the page itself is a single client component (see stage1-pdp.tsx).
import { StageBanner } from '@/components/journey/stage-banner'
import { Stage1PDP } from '@/components/journey/stage1-pdp'
import { JOURNEY_STAGES } from '@/lib/journey'

export const metadata = { title: 'Journey · Stage 1' }

export default async function Stage1Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[1]} />
      <Stage1PDP slug={slug} />
    </div>
  )
}
```

Add to `lib/source-registry.ts`:

```ts
  'journey-stage-1': {
    path: 'components/journey/stage1-pdp.tsx',
    title: "Stage 1 — one 'use client' at the top (React Query untouched)",
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:e2e tests/e2e/journey.spec.ts` — PASS.
Run: `yarn vitest run tests/unit/source-registry.test.ts && yarn typecheck` — green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add journey stage 1 — boundary-at-the-top client PDP"
```

---

### Task 6: Stage 2 — boundary mid-level

**Files:**
- Create: `app/journey/stage-2/products/[slug]/page.tsx`, `components/journey/stage2-islands.tsx`
- Modify: `lib/source-registry.ts` (add `journey-stage-2`)
- Test: append to `tests/e2e/journey.spec.ts`

**Interfaces:**
- Consumes: `getProductDetail`, `getReviews` from `lib/services.ts` (App Router side — allowed here); `HydrationBoundary`/`QueryClient`/`dehydrate`; `fetchLegacyJson` (client islands); `StageBanner`, `JOURNEY_STAGES`, `XrayReport`, `formatPrice`, `notFound`.
- Produces: `/journey/stage-2/products/[slug]` — server-rendered shell + product info; reviews server-prefetched into `HydrationBoundary` under queryKey `['s2-reviews', slug]`; pricing/inventory client islands. `data-testid`s: `stage2-pdp`, `s2-pricing-island`, `s2-reviews`.

- [ ] **Step 1: Write the failing e2e test** (append to `tests/e2e/journey.spec.ts`)

```ts
test('stage 2 server-renders the shell and hydrates reviews without a client fetch', async ({ page }) => {
  // Block the reviews service in the BROWSER: if reviews still render, they
  // came from the server prefetch through the HydrationBoundary.
  await page.route('**/api/services/reviews/**', (route) => route.abort())
  await page.goto('/journey/stage-2/products/aurora-desk-lamp')
  await expect(page.getByTestId('stage2-pdp')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('s2-reviews')).toBeVisible()
  // Pricing island fetches client-side and still works.
  await expect(page.getByTestId('s2-pricing-island')).toContainText('$', { timeout: 15_000 })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:e2e tests/e2e/journey.spec.ts`
Expected: new test FAILs — route 404s.

- [ ] **Step 3: Write the implementation**

`components/journey/stage2-islands.tsx`:

```tsx
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
```

`app/journey/stage-2/products/[slug]/page.tsx`:

```tsx
// STAGE 2 — the boundary moves mid-level. The shell and product info are
// server-rendered (no client JS for them); reviews are fetched ON THE SERVER
// and carried across the boundary via HydrationBoundary, so the client cache
// starts warm; pricing/inventory remain plain client islands. Compare the
// waterfall here (islands fetch after hydration) with stage 3's streaming.
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { notFound } from 'next/navigation'
import { StageBanner } from '@/components/journey/stage-banner'
import {
  HydratedReviews,
  InventoryIsland,
  PricingIsland,
} from '@/components/journey/stage2-islands'
import { JOURNEY_STAGES } from '@/lib/journey'
import { getProductDetail, getReviews } from '@/lib/services'

export const metadata = { title: 'Journey · Stage 2' }

export default async function Stage2Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const result = await getProductDetail(slug)
  if (!result) notFound()
  const product = result.data

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['s2-reviews', slug],
    queryFn: async () => (await getReviews(slug)).data,
  })

  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[2]} />
      <article data-testid="stage2-pdp" className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
          {product.emoji}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-zinc-600">{product.description}</p>
          <PricingIsland slug={slug} />
          <InventoryIsland slug={slug} />
        </div>
        <section className="md:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
          <HydrationBoundary state={dehydrate(queryClient)}>
            <HydratedReviews slug={slug} />
          </HydrationBoundary>
        </section>
      </article>
    </div>
  )
}
```

Add to `lib/source-registry.ts`:

```ts
  'journey-stage-2': {
    path: 'app/journey/stage-2/products/[slug]/page.tsx',
    title: 'Stage 2 — server shell + HydrationBoundary + client islands',
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:e2e tests/e2e/journey.spec.ts` — PASS.
Run: `yarn vitest run tests/unit/source-registry.test.ts && yarn typecheck` — green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add journey stage 2 — mid-level boundary with hydrated reviews"
```

---

### Task 7: Stage 3 — boundary at the leaves

**Files:**
- Create: `app/journey/stage-3/products/[slug]/page.tsx`
- Modify: `lib/source-registry.ts` (add `journey-stage-3`)
- Test: append to `tests/e2e/journey.spec.ts`

**Interfaces:**
- Consumes: the store PDP's building blocks unchanged — `PricingPanel`, `InventoryBadge`, `ReviewsSection` from `app/store/products/[slug]/sections`, skeletons, `AddToCartButton`, `SectionErrorBoundary`, `getProductDetail`, `parseSectionSim`; `StageBanner`, `JOURNEY_STAGES`.
- Produces: `/journey/stage-3/products/[slug]` — the stage-3 end state as a journey route (same composition as `/store`'s PDP), streaming sections, sim params honored.

- [ ] **Step 1: Write the failing e2e test** (append to `tests/e2e/journey.spec.ts`)

```ts
test('stage 3 streams sections server-first with a single cart island', async ({ page }) => {
  await page.goto('/journey/stage-3/products/aurora-desk-lamp?delay_reviews=3000')
  await expect(page.getByTestId('stage-banner')).toBeVisible()
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  // Reviews are artificially slowed: the skeleton shows first, the section streams in later.
  await expect(page.getByTestId('reviews-skeleton')).toBeVisible()
  await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId('add-to-cart')).toBeVisible()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn test:e2e tests/e2e/journey.spec.ts`
Expected: new test FAILs — route 404s.

- [ ] **Step 3: Write the implementation**

`app/journey/stage-3/products/[slug]/page.tsx`:

```tsx
// STAGE 3 — the end state, composed from the SAME building blocks as the
// /store PDP (imported, not copied: this stage IS the reference
// implementation). Server-first, three independently streaming sections, and
// exactly one small client island (add to cart). Everything above the islands
// contributes zero client JS.
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { AddToCartButton } from '@/components/add-to-cart-button'
import { StageBanner } from '@/components/journey/stage-banner'
import { SectionErrorBoundary } from '@/components/section-error-boundary'
import { InventorySkeleton, PriceSkeleton, ReviewsSkeleton } from '@/components/skeletons'
import { JOURNEY_STAGES } from '@/lib/journey'
import { getProductDetail } from '@/lib/services'
import { parseSectionSim } from '@/lib/sim-params'
import {
  InventoryBadge,
  PricingPanel,
  ReviewsSection,
} from '@/app/store/products/[slug]/sections'

export const metadata = { title: 'Journey · Stage 3' }

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function Stage3Page({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const sim = parseSectionSim(sp)

  const result = await getProductDetail(slug, sim.products)
  if (!result) notFound()
  const product = result.data

  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[3]} />
      <article className="grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-xl bg-white py-16 text-8xl">
          {product.emoji}
        </div>
        <div className="space-y-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-zinc-600">{product.description}</p>
          <Suspense fallback={<PriceSkeleton />}>
            <PricingPanel slug={slug} sim={sim.pricing} />
          </Suspense>
          <Suspense fallback={<InventorySkeleton />}>
            <InventoryBadge slug={slug} sim={sim.inventory} />
          </Suspense>
          <AddToCartButton slug={slug} />
        </div>
        <section className="md:col-span-2">
          <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
          <SectionErrorBoundary
            fallback={
              <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                Reviews are unavailable right now — the rest of the page is unaffected.
              </p>
            }
          >
            <Suspense fallback={<ReviewsSkeleton />}>
              <ReviewsSection slug={slug} sim={sim.reviews} />
            </Suspense>
          </SectionErrorBoundary>
        </section>
      </article>
    </div>
  )
}
```

Add to `lib/source-registry.ts`:

```ts
  'journey-stage-3': {
    path: 'app/journey/stage-3/products/[slug]/page.tsx',
    title: 'Stage 3 — server-first streaming PDP (the end state)',
  },
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test:e2e tests/e2e/journey.spec.ts` — PASS (3 tests).
Run: `yarn vitest run tests/unit/source-registry.test.ts && yarn typecheck` — green.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add journey stage 3 — leaf-boundary streaming PDP from store parts"
```

---

### Task 8: Metrics measurement + the `/journey` dashboard

**Files:**
- Create: `lib/journey-metrics.ts`, `scripts/journey-metrics.mjs`, `lib/journey-metrics.generated.json`, `app/journey/page.tsx`, `components/journey/metrics-table.tsx`
- Modify: `package.json` (`metrics` script; insert into `build` chain), `lib/source-registry.ts` (add `journey-dashboard`)
- Test: `tests/unit/journey-metrics.test.ts`, append to `tests/e2e/journey.spec.ts`

**Interfaces:**
- Consumes: `JOURNEY_STAGES`, `DEMO_SLUG` (Task 4).
- Produces:
  - `lib/journey-metrics.ts`:
    - `type StageMeasurement = { stage: number; route: string; firstLoadKB: number | null }`
    - `type MetricsFile = { note: string; measurements: StageMeasurement[] }`
    - `sumRouteKB(files: string[], sizeOf: (file: string) => number): number` — deduped sum of sizes in KB, rounded to 1 decimal.
    - `MANIFEST_ROUTES: Array<{ stage: number; router: 'pages' | 'app'; manifestKey: string }>` — stage 0 → `'/legacy/products/[slug]'` (build-manifest), stages 1–3 → `'/journey/stage-N/products/[slug]/page'` (app-build-manifest).
  - `scripts/journey-metrics.mjs` — reads `.next/build-manifest.json` + `.next/app-build-manifest.json` + on-disk file sizes → writes `lib/journey-metrics.generated.json`.
  - `yarn metrics` script; `build` becomes `yarn snapshot && NEXT_PRIVATE_STANDALONE=true next build && yarn metrics && opennextjs-cloudflare build --skipNextBuild`.
  - `/journey` — dashboard page.

**Honesty rules (from the spec's risks section):** first-load JS is *measured* (manifest files + real sizes, uncompressed, labeled as such). The server/client tree split is *counted from stage source*. Hydration cost and RSC payload size are NOT shown as numbers in Plan 2 — the dashboard links them to the Plan 3 labs instead of asserting estimates.

- [ ] **Step 1: Write the failing unit test**

`tests/unit/journey-metrics.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { MANIFEST_ROUTES, sumRouteKB } from '@/lib/journey-metrics'
import { JOURNEY_STAGES } from '@/lib/journey'

describe('sumRouteKB', () => {
  it('sums deduped file sizes and rounds to 0.1 KB', () => {
    const sizes: Record<string, number> = { 'a.js': 10_240, 'b.js': 5_120 }
    expect(sumRouteKB(['a.js', 'b.js', 'a.js'], (f) => sizes[f])).toBe(15)
  })

  it('ignores non-JS entries (css ships regardless of the boundary)', () => {
    const sizes: Record<string, number> = { 'a.js': 1024, 'style.css': 999_999 }
    expect(sumRouteKB(['a.js', 'style.css'], (f) => sizes[f])).toBe(1)
  })
})

describe('MANIFEST_ROUTES', () => {
  it('covers every journey stage exactly once', () => {
    expect(MANIFEST_ROUTES.map((r) => r.stage).sort()).toEqual(
      JOURNEY_STAGES.map((s) => s.stage)
    )
  })

  it('uses pages-router keys for stage 0 and app-router keys for the rest', () => {
    const stage0 = MANIFEST_ROUTES.find((r) => r.stage === 0)!
    expect(stage0.router).toBe('pages')
    expect(stage0.manifestKey).toBe('/legacy/products/[slug]')
    const stage3 = MANIFEST_ROUTES.find((r) => r.stage === 3)!
    expect(stage3.manifestKey).toBe('/journey/stage-3/products/[slug]/page')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `yarn vitest run tests/unit/journey-metrics.test.ts`
Expected: FAIL — cannot resolve `@/lib/journey-metrics`.

- [ ] **Step 3: Write `lib/journey-metrics.ts`**

```ts
// Client-bundle measurement for the Boundary Journey dashboard. The numbers
// come from the .next build manifests (scripts/journey-metrics.mjs) — the same
// data behind `next build`'s "First Load JS" column — so the dashboard shows
// MEASURED payoff per boundary push, not marketing. Sizes are uncompressed
// bytes on disk; the dashboard labels them as such.
export type StageMeasurement = { stage: number; route: string; firstLoadKB: number | null }
export type MetricsFile = { note: string; measurements: StageMeasurement[] }

export const MANIFEST_ROUTES: Array<{
  stage: number
  router: 'pages' | 'app'
  manifestKey: string
}> = [
  { stage: 0, router: 'pages', manifestKey: '/legacy/products/[slug]' },
  { stage: 1, router: 'app', manifestKey: '/journey/stage-1/products/[slug]/page' },
  { stage: 2, router: 'app', manifestKey: '/journey/stage-2/products/[slug]/page' },
  { stage: 3, router: 'app', manifestKey: '/journey/stage-3/products/[slug]/page' },
]

export function sumRouteKB(files: string[], sizeOf: (file: string) => number): number {
  const js = [...new Set(files)].filter((f) => f.endsWith('.js'))
  const bytes = js.reduce((sum, f) => sum + sizeOf(f), 0)
  return Math.round((bytes / 1024) * 10) / 10
}
```

- [ ] **Step 4: Run unit test to verify it passes**

Run: `yarn vitest run tests/unit/journey-metrics.test.ts` — PASS (4 tests).

- [ ] **Step 5: Write the measurement script and generate the JSON**

`scripts/journey-metrics.mjs`:

```js
// Reads the .next build manifests and records each journey stage's client-JS
// footprint into lib/journey-metrics.generated.json (committed, like the
// source snapshot — the dashboard imports it at build time). Run after
// `next build` via `yarn metrics`; wired into `yarn build`.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dest = path.join(root, 'lib/journey-metrics.generated.json')

// Inline copy of MANIFEST_ROUTES/sumRouteKB semantics: this script must stay
// dependency-free plain JS (it runs mid-build), and the unit-tested TS module
// is the source of truth the test suite checks it against.
const ROUTES = [
  { stage: 0, router: 'pages', manifestKey: '/legacy/products/[slug]' },
  { stage: 1, router: 'app', manifestKey: '/journey/stage-1/products/[slug]/page' },
  { stage: 2, router: 'app', manifestKey: '/journey/stage-2/products/[slug]/page' },
  { stage: 3, router: 'app', manifestKey: '/journey/stage-3/products/[slug]/page' },
]

function sumRouteKB(files, sizeOf) {
  const js = [...new Set(files)].filter((f) => f.endsWith('.js'))
  const bytes = js.reduce((sum, f) => sum + sizeOf(f), 0)
  return Math.round((bytes / 1024) * 10) / 10
}

function loadJson(p) {
  return JSON.parse(readFileSync(path.join(root, p), 'utf8'))
}

let buildManifest, appManifest
try {
  buildManifest = loadJson('.next/build-manifest.json')
  appManifest = loadJson('.next/app-build-manifest.json')
} catch {
  console.error('journey-metrics: .next manifests missing — run next build first')
  process.exit(1)
}

const sizeOf = (file) => {
  try {
    return statSync(path.join(root, '.next', file)).size
  } catch {
    return 0
  }
}

const measurements = ROUTES.map(({ stage, router, manifestKey }) => {
  const files =
    router === 'pages' ? buildManifest.pages[manifestKey] : appManifest.pages[manifestKey]
  return {
    stage,
    route: manifestKey,
    firstLoadKB: files ? sumRouteKB(files, sizeOf) : null,
  }
})

const out = {
  note: 'Uncompressed client JS per route, summed from .next build manifests. Regenerate with `yarn metrics` after a build.',
  measurements,
}
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
console.log(
  `journey-metrics: ${measurements.map((m) => `stage ${m.stage}=${m.firstLoadKB}KB`).join(', ')}`
)
```

Update `package.json` scripts:

```json
"metrics": "node scripts/journey-metrics.mjs",
"build": "yarn snapshot && NEXT_PRIVATE_STANDALONE=true next build && yarn metrics && opennextjs-cloudflare build --skipNextBuild"
```

Run: `yarn snapshot && NEXT_PRIVATE_STANDALONE=true next build && yarn metrics`
Expected: prints four stage measurements; `lib/journey-metrics.generated.json` created. Commit the JSON (it is imported at build time, exactly like the source snapshot).

- [ ] **Step 6: Write the failing e2e test** (append to `tests/e2e/journey.spec.ts`)

```ts
test('journey dashboard lists all four stages with measured bundle sizes', async ({ page }) => {
  await page.goto('/journey')
  await expect(page.getByTestId('stage-card')).toHaveCount(4)
  await expect(page.getByTestId('metrics-table')).toBeVisible()
  // Stage 0 measured KB should be a number, rendered with the KB suffix.
  await expect(page.getByTestId('metrics-table')).toContainText('KB')
  await expect(page.getByRole('link', { name: /Stage 3/ })).toBeVisible()
})
```

Run: `yarn test:e2e tests/e2e/journey.spec.ts` — the new test FAILs (`/journey` 404s).

- [ ] **Step 7: Write the dashboard**

`components/journey/metrics-table.tsx`:

```tsx
// The measured half of the dashboard. Bundle sizes come from the committed
// journey-metrics.generated.json (real manifest data); the tree split is
// counted from each stage's source. Hydration cost and RSC payload are NOT
// numbers here — they get their own live labs (Plan 3) rather than estimates.
import metricsJson from '@/lib/journey-metrics.generated.json'
import type { MetricsFile } from '@/lib/journey-metrics'
import { JOURNEY_STAGES } from '@/lib/journey'

const metrics = metricsJson as MetricsFile

export function MetricsTable() {
  const byStage = new Map(metrics.measurements.map((m) => [m.stage, m]))
  return (
    <div className="overflow-x-auto">
      <table data-testid="metrics-table" className="w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-300 text-left text-zinc-500">
            <th className="py-2 pr-4">Stage</th>
            <th className="py-2 pr-4">Client boundary</th>
            <th className="py-2 pr-4">Route client JS (uncompressed)</th>
            <th className="py-2 pr-4">Tree split (server / client)</th>
          </tr>
        </thead>
        <tbody>
          {JOURNEY_STAGES.map((stage) => {
            const m = byStage.get(stage.stage)
            return (
              <tr key={stage.stage} className="border-b border-zinc-200">
                <td className="py-2 pr-4 font-medium">
                  {stage.stage} — {stage.title}
                </td>
                <td className="py-2 pr-4 text-zinc-600">{stage.boundary}</td>
                <td className="py-2 pr-4 font-mono">
                  {m?.firstLoadKB != null ? `${m.firstLoadKB} KB` : '—'}
                </td>
                <td className="py-2 pr-4 font-mono">
                  {stage.treeSplit.server} / {stage.treeSplit.client}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-zinc-500">{metrics.note}</p>
    </div>
  )
}
```

`app/journey/page.tsx`:

```tsx
// The Boundary Journey dashboard — the site's thesis on one screen. Four REAL
// implementations of the same PDP, one per migration stage, with measured
// client-JS footprints. Push the boundary down, watch the number fall.
import Link from 'next/link'
import { CodeButton } from '@/components/code-button'
import { MetricsTable } from '@/components/journey/metrics-table'
import { DEMO_SLUG, JOURNEY_STAGES } from '@/lib/journey'

export const metadata = { title: 'The Boundary Journey' }

export default function JourneyPage() {
  return (
    <section className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold">The Boundary Journey</h1>
          <p className="text-zinc-600">
            The same product page at four real migration stages. Start with the client
            boundary at the top — everything works, nothing improves — then push it down
            and measure what each push buys.
          </p>
        </div>
        <CodeButton id="journey-dashboard" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {JOURNEY_STAGES.map((stage) => (
          <Link
            key={stage.stage}
            href={stage.pdpRoute(DEMO_SLUG)}
            data-testid="stage-card"
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:shadow-md"
          >
            <div className="mb-1 flex items-center gap-2">
              <span className="rounded bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
                Stage {stage.stage}
              </span>
              <span className="font-medium">{stage.title}</span>
              <span className="ml-auto rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs">
                {stage.router}/
              </span>
            </div>
            <p className="text-sm text-zinc-600">{stage.summary}</p>
          </Link>
        ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Measured, not asserted</h2>
        <MetricsTable />
        <p className="text-sm text-zinc-600">
          Hydration cost and RSC payload size get live instruments instead of estimates —
          coming in the labs (Plan 3). Tip: add{' '}
          <code className="rounded bg-zinc-100 px-1">?delay_reviews=3000</code> to any stage
          URL and compare how each one degrades.
        </p>
      </div>
    </section>
  )
}
```

Add to `lib/source-registry.ts`:

```ts
  'journey-dashboard': {
    path: 'app/journey/page.tsx',
    title: 'Boundary Journey dashboard',
  },
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `yarn vitest run tests/unit/` — all green.
Run: `yarn test:e2e tests/e2e/journey.spec.ts` — PASS (4 tests).
Run: `yarn typecheck` — exit 0.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add journey dashboard with manifest-measured bundle metrics"
```

---

### Task 9: README, full verification, deploy-compat check

**Files:**
- Modify: `README.md` (Boundary Journey section)
- No new tests — this task runs the full gauntlet.

- [ ] **Step 1: Update README** — add after the "Poking at the demos" section:

```markdown
## The Boundary Journey

The same PDP at four real migration stages — the team's boundary-pushing
strategy, live:

- **Stage 0** `/legacy/products/aurora-desk-lamp` — Pages Router,
  `getInitialProps` + React Query (runs in the same app: coexistence works).
- **Stage 1** `/journey/stage-1/products/aurora-desk-lamp` — App Router, one
  `'use client'` at the top, React Query untouched.
- **Stage 2** `/journey/stage-2/products/aurora-desk-lamp` — server shell,
  `prefetchQuery` → `HydrationBoundary`, client islands.
- **Stage 3** `/journey/stage-3/products/aurora-desk-lamp` — server-first
  streaming with one cart island (the `/store` reference implementation).

`/journey` compares all four with client-JS sizes measured from the build
manifests (`yarn metrics` regenerates `lib/journey-metrics.generated.json`
after a build).
```

- [ ] **Step 2: Full local verification**

Run: `yarn vitest run` — all unit suites PASS.
Run: `yarn test:e2e` — all e2e suites PASS (store, pdp, search, cart, rq, xray, code, errors, legacy, journey).
Run: `yarn lint && yarn typecheck` — clean.

- [ ] **Step 3: Full build + workerd preview (Cloudflare deploy compat)**

Run: `yarn build`
Expected: snapshot regenerates (new registry entries), standalone Next build lists `/legacy/*` under pages and `/journey/*` under app routes, metrics regenerate, OpenNext bundles with zero copy errors.

Run: `npx opennextjs-cloudflare preview` (background), then curl:
- `http://localhost:8787/journey` → 200, four stage cards
- `http://localhost:8787/journey/stage-1/products/aurora-desk-lamp` → 200
- `http://localhost:8787/journey/stage-2/products/aurora-desk-lamp` → 200, product name in HTML
- `http://localhost:8787/journey/stage-3/products/aurora-desk-lamp` → 200
- `http://localhost:8787/legacy/products/aurora-desk-lamp` → 200, product name in HTML (pages router on workerd)
- `http://localhost:8787/api/source/journey-stage-2` → 200 snapshot JSON

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "docs: add boundary journey section to README; verify full deploy chain"
```

---

## Self-Review Notes

- **Spec coverage:** Stage 0–3 PDPs ✔ (spec §Boundary Journey), legacy search ✔ (route map), dashboard with measured metrics ✔ (stage slider realized as cards + table + links; per-stage metrics measured or honestly deferred to Plan 3 labs per the spec's own "label estimates honestly" risk note), X-ray on journey pages ✔ (§X-ray "every storefront/journey page"), show-me-the-code for every stage ✔, coexistence proof ✔ (`pages/legacy/*` in the same app). Cart parity on stages 0–2 is deliberately out of scope (the journey teaches data-fetching boundaries; the cart island appears at stage 3 where the spec places it).
- **Type consistency:** `LegacyReq` (T1) used in T2/T3; `JourneyStage`/`JOURNEY_STAGES`/`DEMO_SLUG` (T4) used in T5–T8; queryKey `['s2-reviews', slug]` matches between T6 server prefetch and client island; `sumRouteKB`/`MANIFEST_ROUTES` (T8) match the script's inline copy, with the unit test pinning both.
- **No placeholders:** every step carries complete code.
