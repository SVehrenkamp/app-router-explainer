# Foundation + Storefront Implementation Plan (Plan 1 of 4)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the foundation of the App Router learning site — the working ecommerce demo storefront (PLP, PDP, search, cart) with mock microservices, streaming, Server Actions, React Query coexistence, X-ray mode v1, "show me the code", and dogfooded error handling.

**Architecture:** A Next.js 15.5 App Router app. Mock "microservices" are route handlers under `app/api/services/*` with configurable artificial latency and failure injection; the storefront consumes them over HTTP through a typed server-side client that captures timings. The storefront is the spec's "stage 3" reference implementation: server-first pages with streaming Suspense sections and small client islands. X-ray mode surfaces server/client boundaries and fetch timings via a client context that streamed sections report into.

**Tech Stack:** Next.js 15.5.18 (App Router), React 19.2.6, TypeScript 5, Tailwind CSS 4.3.2, TanStack React Query 5.83.1, Vitest 4.1.10 (unit), Playwright 1.61.1 (e2e), Shiki 4.3.1 (code highlighting).

**Spec:** `docs/superpowers/specs/2026-07-06-app-router-learning-site-design.md`. This plan covers the spec's foundation + `/store` + X-ray + show-me-the-code + error handling. Plans 2–4 (not in this document) will cover: the Boundary Journey + `pages/legacy/*`, the three labs, and the curriculum + drills.

## Global Constraints

- Pinned versions (exact, not ranges): `next@15.5.18`, `react@19.2.6`, `react-dom@19.2.6`, `@tanstack/react-query@5.83.1`, `tailwindcss@4.3.2`, `@tailwindcss/postcss@4.3.2`, `shiki@4.3.1`, `vitest@4.1.10`, `@playwright/test@1.61.1`, `eslint-config-next@15.5.18`. These match the team's production versions by design — do not upgrade.
- TypeScript strict mode. Path alias `@/*` maps to repo root.
- Next.js 15 async APIs everywhere: `params`/`searchParams` are `Promise<...>` and must be awaited; `cookies()`/`headers()` must be awaited.
- Client components are NEVER `async`. Props crossing the server→client boundary must be JSON-serializable (no `Date`, `Map`, functions — Server Actions are the only function exception).
- Server Actions for UI mutations; route handlers only for the mock microservices and the source-code API.
- Do not wrap `redirect()`/`notFound()` in `try/catch`.
- No database, no auth, no external network calls at runtime. All data is in-repo fixtures. No randomness in service responses (deterministic derivation from slug) so tests are stable.
- This is teaching code: every non-obvious file gets a short header comment explaining the App Router concept it demonstrates. Keep these comments — they are product, not noise.
- Commit after every task with the message given in the task's final step. Run `npm run typecheck` before every commit.

## File Structure (this plan)

```
package.json, tsconfig.json, next.config.ts, postcss.config.mjs,
eslint.config.mjs, vitest.config.ts, playwright.config.ts, README.md
app/
  layout.tsx, globals.css, page.tsx            # root shell + landing stub
  error.tsx, global-error.tsx, not-found.tsx   # dogfooded error handling
  providers.tsx                                # React Query provider (client)
  store/
    layout.tsx                                 # storefront shell + X-ray chrome
    page.tsx                                   # PLP (RQ hydration pattern)
    loading.tsx
    search/page.tsx
    products/[slug]/page.tsx                   # PDP (streaming showcase)
    cart/page.tsx
    cart/actions.ts                            # Server Actions
  api/services/products/route.ts               # mock microservices
  api/services/products/[slug]/route.ts
  api/services/pricing/[slug]/route.ts
  api/services/inventory/[slug]/route.ts
  api/services/reviews/[slug]/route.ts
  api/source/[id]/route.ts                     # show-me-the-code
components/
  product-card.tsx, product-grid.tsx, add-to-cart-button.tsx,
  search-box.tsx, skeletons.tsx, section-error-boundary.tsx,
  dev-mode-banner.tsx, code-button.tsx
  xray/provider.tsx, xray/section.tsx, xray/report.tsx,
  xray/panel.tsx, xray/toggle.tsx
lib/
  types.ts, catalog.ts, service-data.ts, service-utils.ts,
  services.ts, cart.ts, products-query.ts, source-registry.ts
tests/
  unit/*.test.ts
  e2e/*.spec.ts
```

---

### Task 1: Project scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`

**Interfaces:**
- Consumes: nothing (first task)
- Produces: a building Next.js app; root layout with `<nav>` linking `/`, `/store`; scripts `dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:e2e`

- [ ] **Step 1: Write config files**

`package.json`:

```json
{
  "name": "app-router-explainer",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "@tanstack/react-query": "5.83.1",
    "next": "15.5.18",
    "react": "19.2.6",
    "react-dom": "19.2.6",
    "server-only": "0.0.1",
    "shiki": "4.3.1"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@playwright/test": "1.61.1",
    "@tailwindcss/postcss": "4.3.2",
    "@types/node": "^24",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.5.18",
    "tailwindcss": "4.3.2",
    "typescript": "^5",
    "vitest": "4.1.10"
  }
}
```

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {}

export default nextConfig
```

`postcss.config.mjs`:

```js
export default {
  plugins: { '@tailwindcss/postcss': {} },
}
```

`eslint.config.mjs`:

```js
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  { ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**'] },
]
```

`.gitignore`:

```
node_modules/
.next/
out/
*.tsbuildinfo
next-env.d.ts
test-results/
playwright-report/
.env*.local
```

- [ ] **Step 2: Write the root layout, global CSS, and landing stub**

`app/globals.css`:

```css
@import 'tailwindcss';
```

`app/layout.tsx`:

```tsx
// Root layout — the App Router replacement for BOTH _app.tsx and _document.tsx.
// It renders <html>/<body> (formerly _document) and wraps every route (formerly _app).
// Unlike _app, it is a Server Component and does NOT re-render on navigation.
import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'App Router Field Guide', template: '%s · App Router Field Guide' },
  description:
    'An interactive guide to migrating a large ecommerce app from the Pages Router to the App Router.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold">
              App Router Field Guide
            </Link>
            <Link href="/store" className="text-sm text-zinc-600 hover:text-zinc-900">
              Demo Store
            </Link>
          </div>
        </nav>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  )
}
```

`app/page.tsx`:

```tsx
// Landing stub. The full landing page (learning path, curriculum links) ships in Plan 4.
import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">App Router Field Guide</h1>
      <p className="max-w-2xl text-zinc-600">
        A hands-on guide to migrating our ecommerce app from the Pages Router to the App
        Router. Start by exploring the demo store — every page in it is a working App Router
        reference implementation.
      </p>
      <Link
        href="/store"
        className="inline-block rounded-lg bg-zinc-900 px-4 py-2 text-white hover:bg-zinc-700"
      >
        Explore the demo store →
      </Link>
    </section>
  )
}
```

- [ ] **Step 3: Install and verify the build**

Run: `npm install`
Expected: resolves with no peer-dependency errors (pinned versions are mutually compatible).

Run: `npm run build`
Expected: `✓ Compiled successfully`, route table lists `/` as static (`○`).

Run: `npm run typecheck`
Expected: exit 0.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js 15.5 app with pinned production-matching versions"
```

---

### Task 2: Catalog data, domain types, Vitest setup

**Files:**
- Create: `lib/types.ts`, `lib/catalog.ts`, `vitest.config.ts`
- Test: `tests/unit/catalog.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `lib/types.ts`: `Product { slug: string; name: string; description: string; emoji: string; category: string; basePriceCents: number }`, `ProductPage { products: Product[]; page: number; pageSize: number; hasMore: boolean }`, `Pricing { slug: string; priceCents: number; listPriceCents: number; currency: 'USD'; promo: string | null }`, `Inventory { slug: string; inStock: boolean; quantity: number; warehouse: string }`, `Review { id: string; author: string; rating: number; body: string }`, `ReviewSummary { slug: string; averageRating: number; reviews: Review[] }`, `ServiceName = 'products' | 'pricing' | 'inventory' | 'reviews'`
  - `lib/catalog.ts`: `PRODUCTS: Product[]` (10 items), `DEFAULT_PAGE_SIZE = 6`, `listProducts(opts?: { page?: number; pageSize?: number; query?: string }): ProductPage`, `getProduct(slug: string): Product | null`

- [ ] **Step 1: Write Vitest config**

`vitest.config.ts`:

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(import.meta.dirname) } },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
})
```

- [ ] **Step 2: Write the failing test**

`tests/unit/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { DEFAULT_PAGE_SIZE, PRODUCTS, getProduct, listProducts } from '@/lib/catalog'

describe('catalog', () => {
  it('has exactly 10 products with unique slugs', () => {
    expect(PRODUCTS).toHaveLength(10)
    expect(new Set(PRODUCTS.map((p) => p.slug)).size).toBe(10)
  })

  it('paginates: page 1 has DEFAULT_PAGE_SIZE items and hasMore', () => {
    const page1 = listProducts()
    expect(page1.products).toHaveLength(DEFAULT_PAGE_SIZE)
    expect(page1.page).toBe(1)
    expect(page1.hasMore).toBe(true)
  })

  it('paginates: page 2 has the remaining 4 items and no more', () => {
    const page2 = listProducts({ page: 2 })
    expect(page2.products).toHaveLength(4)
    expect(page2.hasMore).toBe(false)
  })

  it('filters by query across name and category, case-insensitive', () => {
    const results = listProducts({ query: 'LAMP' })
    expect(results.products.length).toBeGreaterThan(0)
    for (const p of results.products) {
      expect(`${p.name} ${p.category}`.toLowerCase()).toContain('lamp')
    }
  })

  it('getProduct returns the product or null', () => {
    expect(getProduct('aurora-desk-lamp')?.name).toBe('Aurora Desk Lamp')
    expect(getProduct('nope')).toBeNull()
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tests/unit/catalog.test.ts`
Expected: FAIL — cannot resolve `@/lib/catalog`.

- [ ] **Step 4: Write types and catalog**

`lib/types.ts`:

```ts
export type Product = {
  slug: string
  name: string
  description: string
  emoji: string
  category: string
  basePriceCents: number
}

export type ProductPage = {
  products: Product[]
  page: number
  pageSize: number
  hasMore: boolean
}

export type Pricing = {
  slug: string
  priceCents: number
  listPriceCents: number
  currency: 'USD'
  promo: string | null
}

export type Inventory = {
  slug: string
  inStock: boolean
  quantity: number
  warehouse: string
}

export type Review = {
  id: string
  author: string
  rating: number
  body: string
}

export type ReviewSummary = {
  slug: string
  averageRating: number
  reviews: Review[]
}

export type ServiceName = 'products' | 'pricing' | 'inventory' | 'reviews'
```

`lib/catalog.ts`:

```ts
// In-memory product catalog. Stands in for the catalog microservice's database.
// Deterministic fixture data — no randomness, so demos and tests are stable.
import type { Product, ProductPage } from '@/lib/types'

export const DEFAULT_PAGE_SIZE = 6

export const PRODUCTS: Product[] = [
  { slug: 'aurora-desk-lamp', name: 'Aurora Desk Lamp', description: 'A dimmable desk lamp with a warm, sunrise-inspired glow.', emoji: '🛋️', category: 'Lighting', basePriceCents: 8900 },
  { slug: 'cascade-water-bottle', name: 'Cascade Water Bottle', description: 'Insulated steel bottle that keeps drinks cold for 24 hours.', emoji: '🥤', category: 'Kitchen', basePriceCents: 3400 },
  { slug: 'drift-linen-throw', name: 'Drift Linen Throw', description: 'A stonewashed linen throw blanket for slow mornings.', emoji: '🧣', category: 'Textiles', basePriceCents: 12800 },
  { slug: 'ember-candle-set', name: 'Ember Candle Set', description: 'Three hand-poured candles in cedar, fig, and smoke.', emoji: '🕯️', category: 'Home Fragrance', basePriceCents: 5600 },
  { slug: 'harbor-tote-bag', name: 'Harbor Tote Bag', description: 'A waxed-canvas tote built for farmers markets and day trips.', emoji: '👜', category: 'Bags', basePriceCents: 7200 },
  { slug: 'meridian-wall-clock', name: 'Meridian Wall Clock', description: 'A silent-sweep wall clock in brushed brass.', emoji: '🕰️', category: 'Decor', basePriceCents: 9800 },
  { slug: 'nimbus-throw-pillow', name: 'Nimbus Throw Pillow', description: 'A cloud-soft bouclé pillow in oat.', emoji: '🛏️', category: 'Textiles', basePriceCents: 4600 },
  { slug: 'orbit-desk-organizer', name: 'Orbit Desk Organizer', description: 'A modular walnut organizer that spins.', emoji: '🗄️', category: 'Office', basePriceCents: 6400 },
  { slug: 'summit-trail-mug', name: 'Summit Trail Mug', description: 'An enamel camp mug that shrugs off drops.', emoji: '☕', category: 'Kitchen', basePriceCents: 2400 },
  { slug: 'willow-plant-stand', name: 'Willow Plant Stand', description: 'A three-tier rattan stand for your indoor jungle.', emoji: '🪴', category: 'Decor', basePriceCents: 8200 },
]

export function listProducts(opts?: {
  page?: number
  pageSize?: number
  query?: string
}): ProductPage {
  const page = Math.max(1, opts?.page ?? 1)
  const pageSize = Math.max(1, opts?.pageSize ?? DEFAULT_PAGE_SIZE)
  const query = opts?.query?.trim().toLowerCase()

  const matches = query
    ? PRODUCTS.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query))
    : PRODUCTS

  const start = (page - 1) * pageSize
  return {
    products: matches.slice(start, start + pageSize),
    page,
    pageSize,
    hasMore: start + pageSize < matches.length,
  }
}

export function getProduct(slug: string): Product | null {
  return PRODUCTS.find((p) => p.slug === slug) ?? null
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tests/unit/catalog.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add product catalog fixture, domain types, and Vitest setup"
```

---

### Task 3: Service simulation utilities (latency + failure injection)

**Files:**
- Create: `lib/service-utils.ts`
- Test: `tests/unit/service-utils.test.ts`

**Interfaces:**
- Consumes: `ServiceName` from `lib/types.ts`
- Produces:
  - `DEFAULT_DELAY_MS: Record<ServiceName, number>` — `{ products: 150, pricing: 800, inventory: 500, reviews: 1500 }`
  - `parseSimFlags(service: ServiceName, url: URL): { delayMs: number; fail: boolean }` — reads `?delay=` (ms, capped at 10000) and `?fail=1|true`
  - `simulateService(service: ServiceName, request: Request): Promise<{ delayMs: number; fail: boolean }>` — sleeps then returns flags
  - `serviceHeaders(service: ServiceName, delayMs: number, cacheControl: string): Record<string, string>` — `x-service`, `server-timing`, `cache-control`

- [ ] **Step 1: Write the failing test**

`tests/unit/service-utils.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DELAY_MS,
  parseSimFlags,
  serviceHeaders,
  simulateService,
} from '@/lib/service-utils'

describe('parseSimFlags', () => {
  it('uses the per-service default delay when no param is given', () => {
    const flags = parseSimFlags('reviews', new URL('http://x/api?other=1'))
    expect(flags).toEqual({ delayMs: DEFAULT_DELAY_MS.reviews, fail: false })
  })

  it('honors ?delay= override and caps it at 10000', () => {
    expect(parseSimFlags('pricing', new URL('http://x/api?delay=50')).delayMs).toBe(50)
    expect(parseSimFlags('pricing', new URL('http://x/api?delay=99999')).delayMs).toBe(10000)
  })

  it('falls back to the default on a non-numeric or negative delay', () => {
    expect(parseSimFlags('products', new URL('http://x/api?delay=abc')).delayMs).toBe(
      DEFAULT_DELAY_MS.products
    )
    expect(parseSimFlags('products', new URL('http://x/api?delay=-5')).delayMs).toBe(
      DEFAULT_DELAY_MS.products
    )
  })

  it('parses fail=1 and fail=true', () => {
    expect(parseSimFlags('products', new URL('http://x/api?fail=1')).fail).toBe(true)
    expect(parseSimFlags('products', new URL('http://x/api?fail=true')).fail).toBe(true)
    expect(parseSimFlags('products', new URL('http://x/api?fail=0')).fail).toBe(false)
  })
})

describe('simulateService', () => {
  it('resolves with the parsed flags', async () => {
    const flags = await simulateService(
      'inventory',
      new Request('http://x/api?delay=0&fail=1')
    )
    expect(flags).toEqual({ delayMs: 0, fail: true })
  })
})

describe('serviceHeaders', () => {
  it('emits x-service, server-timing, and cache-control', () => {
    expect(serviceHeaders('pricing', 12, 'private, no-store')).toEqual({
      'x-service': 'pricing',
      'server-timing': 'svc;dur=12',
      'cache-control': 'private, no-store',
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/service-utils.test.ts`
Expected: FAIL — cannot resolve `@/lib/service-utils`.

- [ ] **Step 3: Write the implementation**

`lib/service-utils.ts`:

```ts
// Simulation knobs for the mock microservices. Every service route accepts
// ?delay=<ms> and ?fail=1 so demos can make latency and failure visible on demand.
import type { ServiceName } from '@/lib/types'

export const DEFAULT_DELAY_MS: Record<ServiceName, number> = {
  products: 150,
  pricing: 800,
  inventory: 500,
  reviews: 1500,
}

const MAX_DELAY_MS = 10_000

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function parseSimFlags(
  service: ServiceName,
  url: URL
): { delayMs: number; fail: boolean } {
  const raw = url.searchParams.get('delay')
  const parsed = raw === null ? Number.NaN : Number(raw)
  const delayMs =
    Number.isFinite(parsed) && parsed >= 0
      ? Math.min(parsed, MAX_DELAY_MS)
      : DEFAULT_DELAY_MS[service]
  const fail = ['1', 'true'].includes(url.searchParams.get('fail') ?? '')
  return { delayMs, fail }
}

export async function simulateService(
  service: ServiceName,
  request: Request
): Promise<{ delayMs: number; fail: boolean }> {
  const flags = parseSimFlags(service, new URL(request.url))
  await sleep(flags.delayMs)
  return flags
}

export function serviceHeaders(
  service: ServiceName,
  delayMs: number,
  cacheControl: string
): Record<string, string> {
  return {
    'x-service': service,
    'server-timing': `svc;dur=${delayMs}`,
    'cache-control': cacheControl,
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/service-utils.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add latency/failure simulation utilities for mock services"
```

---

### Task 4: Mock microservice route handlers

**Files:**
- Create: `lib/service-data.ts`, `app/api/services/products/route.ts`, `app/api/services/products/[slug]/route.ts`, `app/api/services/pricing/[slug]/route.ts`, `app/api/services/inventory/[slug]/route.ts`, `app/api/services/reviews/[slug]/route.ts`
- Test: `tests/unit/service-routes.test.ts`

**Interfaces:**
- Consumes: `listProducts`/`getProduct` (Task 2), `simulateService`/`serviceHeaders` (Task 3)
- Produces:
  - `lib/service-data.ts`: `pricingFor(product: Product): Pricing`, `inventoryFor(product: Product): Inventory`, `reviewsFor(product: Product): ReviewSummary` — all deterministic (hash of slug, no randomness)
  - HTTP endpoints (all GET):
    - `/api/services/products?page&pageSize&q&delay&fail` → `ProductPage`, cacheable (`public, s-maxage=300, stale-while-revalidate=600`)
    - `/api/services/products/[slug]` → `Product` | 404
    - `/api/services/pricing/[slug]` → `Pricing` (`private, no-store`)
    - `/api/services/inventory/[slug]` → `Inventory` (`private, no-store`)
    - `/api/services/reviews/[slug]` → `ReviewSummary` (`public, s-maxage=60`)
  - All failure responses: `503` with body `{ error: '<service> service unavailable' }`; unknown slug: `404` with `{ error: 'not found' }`

- [ ] **Step 1: Write the failing test**

`tests/unit/service-routes.test.ts` (route handlers are plain functions — call them directly):

```ts
import { describe, expect, it } from 'vitest'
import { GET as getProducts } from '@/app/api/services/products/route'
import { GET as getProductDetail } from '@/app/api/services/products/[slug]/route'
import { GET as getPricing } from '@/app/api/services/pricing/[slug]/route'
import { GET as getInventory } from '@/app/api/services/inventory/[slug]/route'
import { GET as getReviews } from '@/app/api/services/reviews/[slug]/route'

const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) })

describe('products service', () => {
  it('returns a page of products with service headers', async () => {
    const res = await getProducts(
      new Request('http://x/api/services/products?delay=0&page=1')
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('x-service')).toBe('products')
    expect(res.headers.get('cache-control')).toContain('s-maxage=300')
    const body = await res.json()
    expect(body.products).toHaveLength(6)
    expect(body.hasMore).toBe(true)
  })

  it('filters with ?q=', async () => {
    const res = await getProducts(new Request('http://x/api/services/products?delay=0&q=lamp'))
    const body = await res.json()
    expect(body.products.map((p: { slug: string }) => p.slug)).toContain('aurora-desk-lamp')
  })

  it('returns 503 when ?fail=1', async () => {
    const res = await getProducts(new Request('http://x/api/services/products?delay=0&fail=1'))
    expect(res.status).toBe(503)
    expect((await res.json()).error).toBe('products service unavailable')
  })
})

describe('product detail service', () => {
  it('returns the product or 404', async () => {
    const ok = await getProductDetail(
      new Request('http://x/api/services/products/aurora-desk-lamp?delay=0'),
      slugParams('aurora-desk-lamp')
    )
    expect(ok.status).toBe(200)
    expect((await ok.json()).name).toBe('Aurora Desk Lamp')

    const missing = await getProductDetail(
      new Request('http://x/api/services/products/nope?delay=0'),
      slugParams('nope')
    )
    expect(missing.status).toBe(404)
  })
})

describe('per-slug services are deterministic', () => {
  it('pricing returns identical bodies across calls, never exceeding list price', async () => {
    const call = async () =>
      (
        await getPricing(
          new Request('http://x/api/services/pricing/aurora-desk-lamp?delay=0'),
          slugParams('aurora-desk-lamp')
        )
      ).json()
    const [a, b] = [await call(), await call()]
    expect(a).toEqual(b)
    expect(a.priceCents).toBeLessThanOrEqual(a.listPriceCents)
    expect(a.currency).toBe('USD')
  })

  it('inventory and reviews return coherent shapes', async () => {
    const inv = await (
      await getInventory(
        new Request('http://x/api/services/inventory/harbor-tote-bag?delay=0'),
        slugParams('harbor-tote-bag')
      )
    ).json()
    expect(inv.inStock).toBe(inv.quantity > 0)

    const rev = await (
      await getReviews(
        new Request('http://x/api/services/reviews/harbor-tote-bag?delay=0'),
        slugParams('harbor-tote-bag')
      )
    ).json()
    expect(rev.reviews.length).toBeGreaterThanOrEqual(2)
    expect(rev.averageRating).toBeGreaterThanOrEqual(1)
    expect(rev.averageRating).toBeLessThanOrEqual(5)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/service-routes.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write derived data + route handlers**

`lib/service-data.ts`:

```ts
// Deterministic per-product data for the pricing/inventory/reviews services.
// Derived from a slug hash instead of randomness so every request (and test) agrees.
import type { Inventory, Pricing, Product, Review, ReviewSummary } from '@/lib/types'

function hash(input: string): number {
  let h = 0
  for (const ch of input) h = (h * 31 + ch.charCodeAt(0)) % 100_000
  return h
}

export function pricingFor(product: Product): Pricing {
  const discountPct = hash(product.slug) % 30 // 0–29%
  const priceCents = Math.round((product.basePriceCents * (100 - discountPct)) / 100)
  return {
    slug: product.slug,
    priceCents,
    listPriceCents: product.basePriceCents,
    currency: 'USD',
    promo: discountPct >= 15 ? `${discountPct}% off today` : null,
  }
}

const WAREHOUSES = ['Reno NV', 'Columbus OH', 'Allentown PA']

export function inventoryFor(product: Product): Inventory {
  const quantity = hash(`${product.slug}:inv`) % 40 // 0–39
  return {
    slug: product.slug,
    inStock: quantity > 0,
    quantity,
    warehouse: WAREHOUSES[hash(product.slug) % WAREHOUSES.length],
  }
}

const REVIEW_TEMPLATES: Array<Omit<Review, 'id'>> = [
  { author: 'Priya', rating: 5, body: 'Exactly as described. Would buy again.' },
  { author: 'Marcus', rating: 4, body: 'Great quality, shipping took a few days.' },
  { author: 'Elena', rating: 5, body: 'A gift for my sister — she loves it.' },
  { author: 'Sam', rating: 3, body: 'Good, but smaller than I expected.' },
  { author: 'Dana', rating: 4, body: 'Solid build, nice finish.' },
]

export function reviewsFor(product: Product): ReviewSummary {
  const count = 2 + (hash(`${product.slug}:rev`) % 3) // 2–4 reviews
  const offset = hash(product.slug) % REVIEW_TEMPLATES.length
  const reviews = Array.from({ length: count }, (_, i) => {
    const t = REVIEW_TEMPLATES[(offset + i) % REVIEW_TEMPLATES.length]
    return { ...t, id: `${product.slug}-r${i + 1}` }
  })
  const averageRating =
    Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
  return { slug: product.slug, averageRating, reviews }
}
```

`app/api/services/products/route.ts`:

```ts
// Mock "product catalog" microservice. In production this is a separate deployable
// behind Fastly; here it is a route handler so the whole demo is self-contained.
import { listProducts } from '@/lib/catalog'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(request: Request) {
  const { delayMs, fail } = await simulateService('products', request)
  if (fail) {
    return Response.json({ error: 'products service unavailable' }, { status: 503 })
  }
  const { searchParams } = new URL(request.url)
  const page = listProducts({
    page: Number(searchParams.get('page') ?? '1') || 1,
    pageSize: Number(searchParams.get('pageSize') ?? '') || undefined,
    query: searchParams.get('q') ?? undefined,
  })
  return Response.json(page, {
    headers: serviceHeaders('products', delayMs, 'public, s-maxage=300, stale-while-revalidate=600'),
  })
}
```

`app/api/services/products/[slug]/route.ts`:

```ts
import { getProduct } from '@/lib/catalog'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('products', request)
  if (fail) {
    return Response.json({ error: 'products service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(product, {
    headers: serviceHeaders('products', delayMs, 'public, s-maxage=300, stale-while-revalidate=600'),
  })
}
```

`app/api/services/pricing/[slug]/route.ts`:

```ts
// Pricing changes constantly in a real ecommerce stack, so this service is
// deliberately slow (800ms default) and uncacheable — the PDP streams around it.
import { getProduct } from '@/lib/catalog'
import { pricingFor } from '@/lib/service-data'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('pricing', request)
  if (fail) {
    return Response.json({ error: 'pricing service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(pricingFor(product), {
    headers: serviceHeaders('pricing', delayMs, 'private, no-store'),
  })
}
```

`app/api/services/inventory/[slug]/route.ts`:

```ts
import { getProduct } from '@/lib/catalog'
import { inventoryFor } from '@/lib/service-data'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('inventory', request)
  if (fail) {
    return Response.json({ error: 'inventory service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(inventoryFor(product), {
    headers: serviceHeaders('inventory', delayMs, 'private, no-store'),
  })
}
```

`app/api/services/reviews/[slug]/route.ts`:

```ts
// The slowest service (1500ms default) — the reason the PDP's reviews section
// streams in last, and the demo subject for failure injection.
import { getProduct } from '@/lib/catalog'
import { reviewsFor } from '@/lib/service-data'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('reviews', request)
  if (fail) {
    return Response.json({ error: 'reviews service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(reviewsFor(product), {
    headers: serviceHeaders('reviews', delayMs, 'public, s-maxage=60'),
  })
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/service-routes.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add mock microservice route handlers with deterministic data"
```

---

### Task 5: Typed server-side service client with timing capture

**Files:**
- Create: `lib/services.ts`, `lib/sim-params.ts`
- Test: `tests/unit/services.test.ts`, `tests/unit/sim-params.test.ts`

**Interfaces:**
- Consumes: domain types (Task 2); HTTP endpoints (Task 4)
- Produces (`lib/services.ts`, server-only):
  - `SimOverrides { delayMs?: number; fail?: boolean }`
  - `ServiceTiming { service: ServiceName; ms: number }`, `ServiceResult<T> { data: T; timing: ServiceTiming }`
  - `class ServiceError extends Error { service: ServiceName; status: number }`
  - `getProductsPage(opts?: { page?: number; query?: string; sim?: SimOverrides }): Promise<ServiceResult<ProductPage>>` — cached `{ next: { revalidate: 300, tags: ['products'] } }`
  - `getProductDetail(slug: string, sim?: SimOverrides): Promise<ServiceResult<Product> | null>` — null on 404, throws `ServiceError` on other failures; cached like products
  - `getPricing(slug, sim?)`, `getInventory(slug, sim?)`, `getReviews(slug, sim?)` → `ServiceResult<Pricing | Inventory | ReviewSummary>` — all `cache: 'no-store'` (Plan 3's Cache Lab adds cached variants)
- Produces (`lib/sim-params.ts`, isomorphic):
  - `SectionSim = Record<ServiceName, SimOverrides>`
  - `parseSectionSim(searchParams: Record<string, string | string[] | undefined>): SectionSim` — reads `delay_<service>` and `fail_<service>` keys

- [ ] **Step 1: Write the failing tests**

`tests/unit/sim-params.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { parseSectionSim } from '@/lib/sim-params'

describe('parseSectionSim', () => {
  it('returns empty overrides when nothing is set', () => {
    const sim = parseSectionSim({})
    expect(sim.pricing).toEqual({})
    expect(sim.reviews).toEqual({})
  })

  it('parses per-service delay and fail keys', () => {
    const sim = parseSectionSim({ delay_reviews: '2500', fail_pricing: '1' })
    expect(sim.reviews).toEqual({ delayMs: 2500 })
    expect(sim.pricing).toEqual({ fail: true })
    expect(sim.inventory).toEqual({})
  })

  it('ignores non-numeric delays and array values', () => {
    const sim = parseSectionSim({ delay_pricing: 'abc', delay_reviews: ['1', '2'] })
    expect(sim.pricing).toEqual({})
    expect(sim.reviews).toEqual({})
  })
})
```

`tests/unit/services.test.ts` (stub global fetch; the `server-only` import must be aliased out for unit tests — see the vitest config change in Step 3):

```ts
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ServiceError, getPricing, getProductDetail } from '@/lib/services'

afterEach(() => vi.unstubAllGlobals())

function stubFetch(status: number, body: unknown) {
  const mock = vi.fn(async () => Response.json(body, { status }))
  vi.stubGlobal('fetch', mock)
  return mock
}

describe('services client', () => {
  it('returns data plus a timing entry', async () => {
    stubFetch(200, { slug: 'x', priceCents: 100, listPriceCents: 100, currency: 'USD', promo: null })
    const result = await getPricing('x')
    expect(result.data.priceCents).toBe(100)
    expect(result.timing.service).toBe('pricing')
    expect(result.timing.ms).toBeGreaterThanOrEqual(0)
  })

  it('appends sim overrides to the request URL', async () => {
    const mock = stubFetch(200, {})
    await getPricing('x', { delayMs: 0, fail: false })
    const url = String(mock.mock.calls[0][0])
    expect(url).toContain('/api/services/pricing/x')
    expect(url).toContain('delay=0')
  })

  it('throws ServiceError on non-OK responses', async () => {
    stubFetch(503, { error: 'down' })
    await expect(getPricing('x')).rejects.toThrowError(ServiceError)
  })

  it('getProductDetail returns null on 404 instead of throwing', async () => {
    stubFetch(404, { error: 'not found' })
    await expect(getProductDetail('nope')).resolves.toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/unit/sim-params.test.ts tests/unit/services.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Write the implementation**

Add a `server-only` alias so unit tests can import `lib/services.ts` (Next.js enforces the real package at bundle time; Vitest needs a no-op). Modify `vitest.config.ts`:

```ts
import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'server-only': path.resolve(import.meta.dirname, 'tests/unit/server-only-stub.ts'),
      '@': path.resolve(import.meta.dirname),
    },
  },
  test: { environment: 'node', include: ['tests/unit/**/*.test.ts'] },
})
```

`tests/unit/server-only-stub.ts`:

```ts
// No-op stand-in for the `server-only` package under Vitest.
export {}
```

`lib/sim-params.ts`:

```ts
// Parses per-section simulation overrides from a page's searchParams, e.g.
// /store/products/x?delay_reviews=2500&fail_pricing=1
// Reading searchParams opts the route into dynamic rendering — which the PDP
// wants anyway (pricing/inventory are per-request data).
import type { ServiceName } from '@/lib/types'

export type SimOverrides = { delayMs?: number; fail?: boolean }
export type SectionSim = Record<ServiceName, SimOverrides>

const SERVICES: ServiceName[] = ['products', 'pricing', 'inventory', 'reviews']

export function parseSectionSim(
  searchParams: Record<string, string | string[] | undefined>
): SectionSim {
  const sim = {} as SectionSim
  for (const service of SERVICES) {
    const overrides: SimOverrides = {}
    const delay = searchParams[`delay_${service}`]
    if (typeof delay === 'string' && Number.isFinite(Number(delay)) && delay !== '') {
      overrides.delayMs = Number(delay)
    }
    const fail = searchParams[`fail_${service}`]
    if (fail === '1' || fail === 'true') overrides.fail = true
    sim[service] = overrides
  }
  return sim
}
```

`lib/services.ts`:

```ts
// Typed client for the mock microservices — the App Router replacement for the
// data-fetching layer that lived in getInitialProps. Server-only: it never ships
// to the browser, so client bundles carry zero data-fetching plumbing.
import 'server-only'

import type { SimOverrides } from '@/lib/sim-params'
import type {
  Inventory,
  Pricing,
  Product,
  ProductPage,
  ReviewSummary,
  ServiceName,
} from '@/lib/types'

export type { SimOverrides }

export type ServiceTiming = { service: ServiceName; ms: number }
export type ServiceResult<T> = { data: T; timing: ServiceTiming }

export class ServiceError extends Error {
  constructor(
    public readonly service: ServiceName,
    public readonly status: number
  ) {
    super(`${service} service responded ${status}`)
    this.name = 'ServiceError'
  }
}

function serviceUrl(path: string, sim?: SimOverrides): string {
  const base = process.env.SERVICES_BASE_URL ?? 'http://localhost:3000'
  const url = new URL(path, base)
  if (sim?.delayMs !== undefined) url.searchParams.set('delay', String(sim.delayMs))
  if (sim?.fail) url.searchParams.set('fail', '1')
  return url.toString()
}

async function fetchService<T>(
  service: ServiceName,
  path: string,
  init: RequestInit,
  sim?: SimOverrides
): Promise<ServiceResult<T>> {
  const started = performance.now()
  const res = await fetch(serviceUrl(path, sim), init)
  const ms = Math.round(performance.now() - started)
  if (!res.ok) throw new ServiceError(service, res.status)
  return { data: (await res.json()) as T, timing: { service, ms } }
}

export function getProductsPage(opts?: {
  page?: number
  query?: string
  sim?: SimOverrides
}): Promise<ServiceResult<ProductPage>> {
  const params = new URLSearchParams()
  if (opts?.page) params.set('page', String(opts.page))
  if (opts?.query) params.set('q', opts.query)
  const qs = params.toString()
  return fetchService(
    'products',
    `/api/services/products${qs ? `?${qs}` : ''}`,
    { next: { revalidate: 300, tags: ['products'] } },
    opts?.sim
  )
}

export async function getProductDetail(
  slug: string,
  sim?: SimOverrides
): Promise<ServiceResult<Product> | null> {
  try {
    return await fetchService<Product>(
      'products',
      `/api/services/products/${slug}`,
      { next: { revalidate: 300, tags: ['products'] } },
      sim
    )
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return null
    throw error
  }
}

export function getPricing(slug: string, sim?: SimOverrides) {
  return fetchService<Pricing>(
    'pricing',
    `/api/services/pricing/${slug}`,
    { cache: 'no-store' },
    sim
  )
}

export function getInventory(slug: string, sim?: SimOverrides) {
  return fetchService<Inventory>(
    'inventory',
    `/api/services/inventory/${slug}`,
    { cache: 'no-store' },
    sim
  )
}

export function getReviews(slug: string, sim?: SimOverrides) {
  return fetchService<ReviewSummary>(
    'reviews',
    `/api/services/reviews/${slug}`,
    { cache: 'no-store' },
    sim
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS — all unit tests including Tasks 2–4 suites.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add typed server-only service client with timing capture"
```

---

### Task 6: Storefront shell, PLP v1, Playwright setup

**Files:**
- Create: `app/store/layout.tsx`, `app/store/page.tsx`, `app/store/loading.tsx`, `components/product-card.tsx`, `components/skeletons.tsx`, `lib/format.ts`, `playwright.config.ts`
- Test: `tests/e2e/store.spec.ts`

**Interfaces:**
- Consumes: `getProductsPage` (Task 5), `Product` (Task 2)
- Produces:
  - `lib/format.ts`: `formatPrice(cents: number): string` (USD via `Intl.NumberFormat`)
  - `components/product-card.tsx`: `ProductCard({ product }: { product: Product })` — server component, links to `/store/products/[slug]`, `data-testid="product-card"`
  - `components/skeletons.tsx`: `GridSkeleton`, `PriceSkeleton`, `InventorySkeleton`, `ReviewsSkeleton` — each with `data-testid="<name>-skeleton"` (kebab-case: `grid-skeleton`, `price-skeleton`, `inventory-skeleton`, `reviews-skeleton`)
  - `/store` renders a 6-card grid (`data-testid="product-grid"`); storefront layout with links to `/store`, `/store/search`, `/store/cart`
  - Playwright runs `npm run dev -- --port 3111` with `SERVICES_BASE_URL=http://localhost:3111`

Note: this task renders the PLP as a plain server component. Task 10 deliberately refactors it to the React Query hydration pattern — the plan keeps both versions in git history because the diff itself is teaching material.

- [ ] **Step 1: Write Playwright config and the failing test**

`playwright.config.ts`:

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:3111' },
  webServer: {
    command: 'npm run dev -- --port 3111',
    url: 'http://localhost:3111',
    env: { SERVICES_BASE_URL: 'http://localhost:3111' },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

`tests/e2e/store.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('PLP renders the first page of products', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByTestId('product-card')).toHaveCount(6)
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
})

test('storefront layout links to search and cart', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByRole('link', { name: 'Search' })).toBeVisible()
  await expect(page.getByRole('link', { name: /Cart/ })).toBeVisible()
})
```

Run: `npx playwright install chromium` (one-time browser download)
Run: `npm run test:e2e`
Expected: FAIL — `/store` is 404.

- [ ] **Step 2: Write the implementation**

`lib/format.ts`:

```ts
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
    cents / 100
  )
}
```

`app/store/layout.tsx`:

```tsx
// Nested layout — persists across /store/* navigations WITHOUT re-rendering.
// In the Pages Router, _app re-ran on every navigation; here the layout's state
// and DOM survive while only the page below it swaps.
import Link from 'next/link'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
        <Link href="/store" className="text-xl font-semibold">
          Fieldgoods
        </Link>
        <Link href="/store/search" className="text-sm text-zinc-600 hover:text-zinc-900">
          Search
        </Link>
        <Link href="/store/cart" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cart
        </Link>
      </header>
      {children}
    </div>
  )
}
```

`components/product-card.tsx`:

```tsx
// Server component — renders to HTML on the server, contributes ZERO client JS.
import Link from 'next/link'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/store/products/${product.slug}`}
      data-testid="product-card"
      className="rounded-xl border border-zinc-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="mb-3 text-5xl">{product.emoji}</div>
      <div className="text-xs uppercase tracking-wide text-zinc-500">{product.category}</div>
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-zinc-600">{formatPrice(product.basePriceCents)}</div>
    </Link>
  )
}
```

`components/skeletons.tsx`:

```tsx
// Suspense fallbacks. Named data-testids let e2e tests assert that streaming
// really is progressive (skeleton visible while slower sections resolve).
export function GridSkeleton() {
  return (
    <div data-testid="grid-skeleton" className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-200" />
      ))}
    </div>
  )
}

export function PriceSkeleton() {
  return <div data-testid="price-skeleton" className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
}

export function InventorySkeleton() {
  return <div data-testid="inventory-skeleton" className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
}

export function ReviewsSkeleton() {
  return (
    <div data-testid="reviews-skeleton" className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200" />
      ))}
    </div>
  )
}
```

`app/store/page.tsx` (v1 — refactored to React Query hydration in Task 10):

```tsx
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
```

`app/store/loading.tsx`:

```tsx
// loading.tsx = an automatic Suspense boundary around the page. The Pages Router
// had no equivalent: you either blocked navigation or hand-rolled spinners.
import { GridSkeleton } from '@/components/skeletons'

export default function StoreLoading() {
  return <GridSkeleton />
}
```

- [ ] **Step 3: Run the e2e test to verify it passes**

Run: `npm run test:e2e`
Expected: PASS (2 tests).

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add storefront shell and server-rendered PLP with Playwright setup"
```

---

### Task 7: Streaming PDP

**Files:**
- Create: `app/store/products/[slug]/page.tsx`, `app/store/products/[slug]/sections.tsx`
- Test: `tests/e2e/pdp.spec.ts`

**Interfaces:**
- Consumes: `getProductDetail`, `getPricing`, `getInventory`, `getReviews` (Task 5), `parseSectionSim` (Task 5), skeletons (Task 6), `formatPrice` (Task 6)
- Produces:
  - `/store/products/[slug]` — streams: product info renders immediately; `PricingPanel`, `InventoryBadge`, `ReviewsSection` resolve independently behind Suspense
  - `sections.tsx` exports async server components: `PricingPanel({ slug, sim }: { slug: string; sim: SimOverrides })`, `InventoryBadge(...)`, `ReviewsSection(...)` — same prop shape; each renders `data-testid="pricing-panel" | "inventory-badge" | "reviews-section"`
  - Unknown slug → `notFound()` (404)
  - Section sim overrides flow from URL: `?delay_reviews=2500&fail_pricing=1`

- [ ] **Step 1: Write the failing test**

`tests/e2e/pdp.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('PDP streams: product info is visible while reviews are still loading', async ({
  page,
}) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_products=0&delay_pricing=100&delay_inventory=100&delay_reviews=3000'
  )
  // Shell content arrived...
  await expect(page.getByRole('heading', { name: 'Aurora Desk Lamp' })).toBeVisible()
  // ...while the slowest section is still a skeleton...
  await expect(page.getByTestId('reviews-skeleton')).toBeVisible()
  // ...and later resolves without a navigation.
  await expect(page.getByTestId('reviews-section')).toBeVisible({ timeout: 10_000 })
  await expect(page.getByTestId('reviews-skeleton')).toHaveCount(0)
})

test('PDP renders pricing and inventory from their services', async ({ page }) => {
  await page.goto('/store/products/cascade-water-bottle?delay_pricing=0&delay_inventory=0&delay_reviews=0')
  await expect(page.getByTestId('pricing-panel')).toBeVisible()
  await expect(page.getByTestId('inventory-badge')).toBeVisible()
})

test('unknown product returns a 404', async ({ page }) => {
  const response = await page.goto('/store/products/does-not-exist?delay_products=0')
  expect(response?.status()).toBe(404)
})

test('PLP card navigates to the PDP', async ({ page }) => {
  await page.goto('/store')
  await page.getByTestId('product-card').first().click()
  await expect(page.getByTestId('pricing-panel')).toBeVisible({ timeout: 10_000 })
})
```

Run: `npm run test:e2e -- pdp.spec.ts`
Expected: FAIL — route is 404 for every test.

- [ ] **Step 2: Write the implementation**

`app/store/products/[slug]/sections.tsx`:

```tsx
// Three independently-streaming sections. Each is an async Server Component that
// awaits ONE microservice. Because each sits behind its own <Suspense>, a slow
// service delays only its own section — the getInitialProps model (slowest service
// gates the whole page) is gone.
import { formatPrice } from '@/lib/format'
import type { SimOverrides } from '@/lib/sim-params'
import { getInventory, getPricing, getReviews } from '@/lib/services'

type SectionProps = { slug: string; sim: SimOverrides }

export async function PricingPanel({ slug, sim }: SectionProps) {
  const { data } = await getPricing(slug, sim)
  return (
    <div data-testid="pricing-panel" className="space-y-1">
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
  const { data } = await getInventory(slug, sim)
  return (
    <div data-testid="inventory-badge" className="text-sm">
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
  const { data } = await getReviews(slug, sim)
  return (
    <div data-testid="reviews-section" className="space-y-3">
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

`app/store/products/[slug]/page.tsx`:

```tsx
// The streaming PDP. params/searchParams are Promises in Next 15 — await them.
// Reading searchParams opts this route into dynamic rendering, which it wants
// anyway: pricing and inventory are per-request data.
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InventorySkeleton, PriceSkeleton, ReviewsSkeleton } from '@/components/skeletons'
import { getProductDetail } from '@/lib/services'
import { parseSectionSim } from '@/lib/sim-params'
import { InventoryBadge, PricingPanel, ReviewsSection } from './sections'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  // Request memoization dedupes this with the page's own fetch (same URL, same render).
  const result = await getProductDetail(slug)
  return { title: result ? result.data.name : 'Not found' }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const sim = parseSectionSim(sp)

  const result = await getProductDetail(slug, sim.products)
  if (!result) notFound()
  const product = result.data

  return (
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
      </div>
      <section className="md:col-span-2">
        <h2 className="mb-3 text-xl font-semibold">Reviews</h2>
        <Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsSection slug={slug} sim={sim.reviews} />
        </Suspense>
      </section>
    </article>
  )
}
```

- [ ] **Step 3: Run the e2e tests to verify they pass**

Run: `npm run test:e2e -- pdp.spec.ts`
Expected: PASS (4 tests). If the streaming assertion flakes, raise `delay_reviews` — never poll-sleep.

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add streaming PDP with per-service Suspense sections"
```

---

### Task 8: Search page

**Files:**
- Create: `app/store/search/page.tsx`, `components/search-box.tsx`
- Test: `tests/e2e/search.spec.ts`

**Interfaces:**
- Consumes: `getProductsPage` (Task 5), `ProductCard` (Task 6)
- Produces: `/store/search?q=` — server-rendered results; `SearchBox({ defaultValue }: { defaultValue?: string })` — a **server component** form (GET submission, works with JS disabled)

- [ ] **Step 1: Write the failing test**

`tests/e2e/search.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('search finds products by query param', async ({ page }) => {
  await page.goto('/store/search?q=lamp')
  await expect(page.getByText('Aurora Desk Lamp')).toBeVisible()
  await expect(page.getByTestId('product-card')).toHaveCount(1)
})

test('search form submits via GET (no client JS required)', async ({ page }) => {
  await page.goto('/store/search')
  await page.getByRole('searchbox').fill('mug')
  await page.getByRole('button', { name: 'Search' }).click()
  await expect(page).toHaveURL(/q=mug/)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()
})

test('empty results show a friendly message', async ({ page }) => {
  await page.goto('/store/search?q=zzzz')
  await expect(page.getByText(/No products match/)).toBeVisible()
})
```

Run: `npm run test:e2e -- search.spec.ts`
Expected: FAIL — route is 404.

- [ ] **Step 2: Write the implementation**

`components/search-box.tsx`:

```tsx
// A search form with ZERO client JavaScript. A plain GET form submits to the
// same route; the server re-renders with the new searchParams. Progressive
// enhancement isn't extra work in the App Router — it's the default.
export function SearchBox({ defaultValue }: { defaultValue?: string }) {
  return (
    <form action="/store/search" className="flex gap-2">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search products…"
        className="w-64 rounded-lg border border-zinc-300 px-3 py-2"
      />
      <button type="submit" className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
        Search
      </button>
    </form>
  )
}
```

`app/store/search/page.tsx`:

```tsx
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
        <p className="text-zinc-600">No products match “{query}”.</p>
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
```

- [ ] **Step 3: Run the e2e tests to verify they pass**

Run: `npm run test:e2e -- search.spec.ts`
Expected: PASS (3 tests).

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add server-rendered search with progressive-enhancement form"
```

---

### Task 9: Cart — cookie state, Server Actions, client island

**Files:**
- Create: `lib/cart.ts`, `app/store/cart/actions.ts`, `app/store/cart/page.tsx`, `components/add-to-cart-button.tsx`
- Modify: `app/store/products/[slug]/page.tsx` (add `<AddToCartButton slug={slug} />` directly below the `InventoryBadge` Suspense boundary)
- Test: `tests/unit/cart.test.ts`, `tests/e2e/cart.spec.ts`

**Interfaces:**
- Consumes: `getProductDetail`/`getPricing` (Task 5), `formatPrice` (Task 6)
- Produces:
  - `lib/cart.ts` (pure, isomorphic): `CartItem { slug: string; qty: number }`, `CART_COOKIE = 'demo-cart'`, `parseCart(raw: string | undefined): CartItem[]`, `serializeCart(items: CartItem[]): string`, `addItem(items: CartItem[], slug: string, qty?: number): CartItem[]`, `setItemQty(items: CartItem[], slug: string, qty: number): CartItem[]` (qty ≤ 0 removes), `cartCount(items: CartItem[]): number`
  - `app/store/cart/actions.ts` (`'use server'`): `CartActionState { ok: boolean; count: number; error: string | null }`, `addToCart(prevState: CartActionState, formData: FormData): Promise<CartActionState>` (reads `slug` field), `updateQuantity(formData: FormData): Promise<void>` (reads `slug` + `qty`; qty 0 removes)
  - `AddToCartButton({ slug }: { slug: string })` — client island using `useActionState`, `data-testid="add-to-cart"`
  - `/store/cart` — dynamic (reads cookies), line rows `data-testid="cart-line"`, subtotal `data-testid="cart-subtotal"`

- [ ] **Step 1: Write the failing unit test**

`tests/unit/cart.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { addItem, cartCount, parseCart, serializeCart, setItemQty } from '@/lib/cart'

describe('cart codec', () => {
  it('round-trips through serialize/parse', () => {
    const items = [{ slug: 'a', qty: 2 }]
    expect(parseCart(serializeCart(items))).toEqual(items)
  })

  it('tolerates garbage cookies', () => {
    expect(parseCart(undefined)).toEqual([])
    expect(parseCart('not json')).toEqual([])
    expect(parseCart('{"nope":1}')).toEqual([])
    expect(parseCart('[{"slug":1,"qty":"x"}]')).toEqual([])
  })

  it('clamps quantities to 1–99 on parse', () => {
    expect(parseCart('[{"slug":"a","qty":500}]')).toEqual([{ slug: 'a', qty: 99 }])
    expect(parseCart('[{"slug":"a","qty":0}]')).toEqual([])
  })

  it('addItem merges duplicate slugs', () => {
    const items = addItem(addItem([], 'a'), 'a')
    expect(items).toEqual([{ slug: 'a', qty: 2 }])
  })

  it('setItemQty updates and removes at zero', () => {
    expect(setItemQty([{ slug: 'a', qty: 1 }], 'a', 3)).toEqual([{ slug: 'a', qty: 3 }])
    expect(setItemQty([{ slug: 'a', qty: 1 }], 'a', 0)).toEqual([])
  })

  it('cartCount sums quantities', () => {
    expect(cartCount([{ slug: 'a', qty: 2 }, { slug: 'b', qty: 1 }])).toBe(3)
  })
})
```

Run: `npx vitest run tests/unit/cart.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 2: Write `lib/cart.ts`**

```ts
// Pure cart logic over a cookie-serialized value. Kept free of next/headers so
// it is unit-testable and importable from both actions and pages.
export type CartItem = { slug: string; qty: number }

export const CART_COOKIE = 'demo-cart'
const MAX_QTY = 99

function clampQty(qty: number): number {
  return Math.min(Math.max(Math.trunc(qty), 0), MAX_QTY)
}

export function parseCart(raw: string | undefined): CartItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const items: CartItem[] = []
    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as CartItem).slug === 'string' &&
        typeof (entry as CartItem).qty === 'number'
      ) {
        const qty = clampQty((entry as CartItem).qty)
        if (qty > 0 && !items.some((i) => i.slug === (entry as CartItem).slug)) {
          items.push({ slug: (entry as CartItem).slug, qty })
        }
      }
    }
    return items
  } catch {
    return []
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items)
}

export function addItem(items: CartItem[], slug: string, qty = 1): CartItem[] {
  const existing = items.find((i) => i.slug === slug)
  if (!existing) return [...items, { slug, qty: clampQty(qty) || 1 }]
  return items.map((i) =>
    i.slug === slug ? { ...i, qty: clampQty(i.qty + qty) || 1 } : i
  )
}

export function setItemQty(items: CartItem[], slug: string, qty: number): CartItem[] {
  const clamped = clampQty(qty)
  if (clamped === 0) return items.filter((i) => i.slug !== slug)
  return items.map((i) => (i.slug === slug ? { ...i, qty: clamped } : i))
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0)
}
```

Run: `npx vitest run tests/unit/cart.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 3: Write the failing e2e test**

`tests/e2e/cart.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

const FAST_PDP =
  '/store/products/summit-trail-mug?delay_pricing=0&delay_inventory=0&delay_reviews=0'

test('add to cart from the PDP, then manage it on the cart page', async ({ page }) => {
  await page.goto(FAST_PDP)
  await page.getByTestId('add-to-cart').click()
  await expect(page.getByTestId('add-to-cart')).toContainText('Added ✓ (1 in cart)')

  await page.goto('/store/cart')
  await expect(page.getByTestId('cart-line')).toHaveCount(1)
  await expect(page.getByText('Summit Trail Mug')).toBeVisible()

  // Update quantity via a plain form + Server Action
  await page.getByRole('spinbutton').fill('3')
  await page.getByRole('button', { name: 'Update' }).click()
  await expect(page.getByTestId('cart-subtotal')).not.toContainText('$0.00')

  // Remove
  await page.getByRole('button', { name: 'Remove' }).click()
  await expect(page.getByText('Your cart is empty')).toBeVisible()
})
```

Run: `npm run test:e2e -- cart.spec.ts`
Expected: FAIL — no add-to-cart button exists.

- [ ] **Step 4: Write actions, button, cart page; wire the button into the PDP**

`app/store/cart/actions.ts`:

```ts
'use server'

// Server Actions — the App Router replacement for POSTing to pages/api/cart.
// They run only on the server, can write cookies (RSC render cannot), and are
// the ONLY kind of function that may cross the server→client boundary as a prop.
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import {
  CART_COOKIE,
  addItem,
  cartCount,
  parseCart,
  serializeCart,
  setItemQty,
} from '@/lib/cart'

export type CartActionState = { ok: boolean; count: number; error: string | null }

export async function addToCart(
  prevState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const slug = formData.get('slug')
  if (typeof slug !== 'string' || slug === '') {
    return { ok: false, count: prevState.count, error: 'Missing product' }
  }
  const cookieStore = await cookies()
  const items = addItem(parseCart(cookieStore.get(CART_COOKIE)?.value), slug)
  cookieStore.set(CART_COOKIE, serializeCart(items), { path: '/' })
  revalidatePath('/store/cart')
  return { ok: true, count: cartCount(items), error: null }
}

export async function updateQuantity(formData: FormData): Promise<void> {
  const slug = formData.get('slug')
  const qty = Number(formData.get('qty'))
  if (typeof slug !== 'string' || !Number.isFinite(qty)) return
  const cookieStore = await cookies()
  const items = setItemQty(parseCart(cookieStore.get(CART_COOKIE)?.value), slug, qty)
  cookieStore.set(CART_COOKIE, serializeCart(items), { path: '/' })
  revalidatePath('/store/cart')
}
```

`components/add-to-cart-button.tsx`:

```tsx
'use client'

// A deliberately SMALL client island on an otherwise-server PDP.
// useActionState wires a Server Action into client state (pending / result).
import { useActionState } from 'react'
import { addToCart, type CartActionState } from '@/app/store/cart/actions'

const initialState: CartActionState = { ok: false, count: 0, error: null }

export function AddToCartButton({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState(addToCart, initialState)
  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isPending}
        data-testid="add-to-cart"
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? 'Adding…' : state.ok ? `Added ✓ (${state.count} in cart)` : 'Add to cart'}
      </button>
      {state.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
```

In `app/store/products/[slug]/page.tsx`, import the button and render it directly after the `InventoryBadge` Suspense boundary:

```tsx
import { AddToCartButton } from '@/components/add-to-cart-button'
// ... inside the right-hand column, after the InventoryBadge <Suspense>:
        <AddToCartButton slug={slug} />
```

`app/store/cart/page.tsx`:

```tsx
// The cart page reads cookies() — that makes it dynamic, rendered per-request.
// Line-item data fans out with Promise.all (parallel, not a waterfall), and the
// quantity/remove forms post to Server Actions from a SERVER component: no
// client JS needed for any of this page.
import Link from 'next/link'
import { cookies } from 'next/headers'
import { formatPrice } from '@/lib/format'
import { CART_COOKIE, parseCart } from '@/lib/cart'
import { getPricing, getProductDetail } from '@/lib/services'
import { updateQuantity } from './actions'

export const metadata = { title: 'Cart' }

export default async function CartPage() {
  const cookieStore = await cookies()
  const items = parseCart(cookieStore.get(CART_COOKIE)?.value)

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-zinc-600">Your cart is empty.</p>
        <Link href="/store" className="text-zinc-900 underline">
          Browse products →
        </Link>
      </section>
    )
  }

  const lines = (
    await Promise.all(
      items.map(async (item) => {
        const [detail, pricing] = await Promise.all([
          getProductDetail(item.slug),
          getPricing(item.slug, { delayMs: 0 }),
        ])
        return detail ? { item, product: detail.data, pricing: pricing.data } : null
      })
    )
  ).filter((line) => line !== null)

  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.pricing.priceCents * line.item.qty,
    0
  )

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold">Cart</h1>
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {lines.map((line) => (
          <li key={line.item.slug} data-testid="cart-line" className="flex items-center gap-4 p-4">
            <span className="text-3xl">{line.product.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{line.product.name}</div>
              <div className="text-sm text-zinc-600">{formatPrice(line.pricing.priceCents)} each</div>
            </div>
            <form action={updateQuantity} className="flex items-center gap-2">
              <input type="hidden" name="slug" value={line.item.slug} />
              <input
                type="number"
                name="qty"
                min={0}
                max={99}
                defaultValue={line.item.qty}
                className="w-16 rounded border border-zinc-300 px-2 py-1"
              />
              <button type="submit" className="rounded border border-zinc-300 px-3 py-1 text-sm">
                Update
              </button>
            </form>
            <form action={updateQuantity}>
              <input type="hidden" name="slug" value={line.item.slug} />
              <input type="hidden" name="qty" value="0" />
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      <div className="text-right text-lg font-semibold" data-testid="cart-subtotal">
        Subtotal: {formatPrice(subtotalCents)}
      </div>
    </section>
  )
}
```

- [ ] **Step 5: Run all tests to verify they pass**

Run: `npx vitest run && npm run test:e2e -- cart.spec.ts pdp.spec.ts`
Expected: PASS — including the PDP suite (the new button must not break streaming assertions).

- [ ] **Step 6: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add cookie-backed cart with Server Actions and client island"
```

---

### Task 10: React Query coexistence on the PLP (prefetch → HydrationBoundary → useSuspenseInfiniteQuery)

**Files:**
- Create: `app/providers.tsx`, `lib/products-query.ts`, `components/product-grid.tsx`
- Modify: `app/layout.tsx` (wrap page content in `<Providers>`), `app/store/page.tsx` (replace v1 body)
- Test: `tests/e2e/rq.spec.ts`

**Interfaces:**
- Consumes: `/api/services/products` endpoint (Task 4), `ProductCard` (Task 6)
- Produces:
  - `Providers({ children })` — client component owning the `QueryClient`
  - `productsQueryOptions` — `infiniteQueryOptions` shared by server prefetch and client hook (`queryKey: ['products']`, `initialPageParam: 1`)
  - `ProductGrid()` — client component, `data-testid="load-more"` button
  - `/store` still SSRs page 1 (HTML contains product names), then paginates client-side

This task intentionally **refactors** the Task 6 PLP. The git diff of this task is the teaching artifact for spec module 6: "plain server fetch" → "React Query coexistence" with zero visible behavior change on first paint.

- [ ] **Step 1: Write the failing test**

`tests/e2e/rq.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('PLP page 1 is server-rendered HTML (hydration, not client fetch)', async ({ page }) => {
  const res = await page.request.get('/store')
  expect(await res.text()).toContain('Aurora Desk Lamp')
})

test('Load more appends page 2 via client-side React Query', async ({ page }) => {
  await page.goto('/store')
  await expect(page.getByTestId('product-card')).toHaveCount(6)
  await page.getByTestId('load-more').click()
  await expect(page.getByTestId('product-card')).toHaveCount(10)
  await expect(page.getByTestId('load-more')).toHaveCount(0) // no page 3
})
```

Run: `npm run test:e2e -- rq.spec.ts`
Expected: FAIL — no load-more button exists.

- [ ] **Step 2: Write the implementation**

`app/providers.tsx`:

```tsx
'use client'

// In the Pages Router this provider lived in _app.tsx. Here it is a client
// component that the (server) root layout wraps around the app — a server
// component may freely render client children.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // useState(() => ...) gives one client per browser session but a FRESH client
  // per server render — never share a QueryClient across requests on the server.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
```

Modify `app/layout.tsx` — import and wrap:

```tsx
import { Providers } from '@/app/providers'
// ... in the body, replace the existing <main> line with:
        <Providers>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
```

`lib/products-query.ts`:

```tsx
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
```

`components/product-grid.tsx`:

```tsx
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
import { ProductCard } from '@/components/product-card'
import { productsQueryOptions } from '@/lib/products-query'

export function ProductGrid() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery(productsQueryOptions)
  const products = data.pages.flatMap((page) => page.products)

  return (
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
  )
}
```

`app/store/page.tsx` (replace the whole file):

```tsx
// The PLP demonstrating React Query coexistence (spec module 6):
//   1. A request-scoped QueryClient prefetches page 1 ON THE SERVER.
//   2. dehydrate() serializes the cache; HydrationBoundary carries it across
//      the server→client boundary as a prop.
//   3. The client ProductGrid reads it via useSuspenseInfiniteQuery — SSR HTML
//      on first paint, zero duplicate fetch — then paginates client-side.
import { HydrationBoundary, QueryClient, dehydrate } from '@tanstack/react-query'
import { ProductGrid } from '@/components/product-grid'
import { productsQueryOptions } from '@/lib/products-query'

export const metadata = { title: 'Demo Store' }

export default async function StorePage() {
  const queryClient = new QueryClient()
  await queryClient.prefetchInfiniteQuery(productsQueryOptions)

  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">All products</h1>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <ProductGrid />
      </HydrationBoundary>
    </section>
  )
}
```

- [ ] **Step 3: Run the e2e tests to verify they pass**

Run: `npm run test:e2e -- rq.spec.ts store.spec.ts`
Expected: PASS — including the original Task 6 assertions (6 cards on first paint).

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: refactor PLP to React Query prefetch/HydrationBoundary pattern"
```

---

### Task 11: X-ray mode v1

**Files:**
- Create: `components/xray/provider.tsx`, `components/xray/report.tsx`, `components/xray/toggle.tsx`, `components/xray/panel.tsx`
- Modify: `app/store/layout.tsx` (wrap in provider, render toggle + panel), `app/store/products/[slug]/sections.tsx` (report timings), `components/product-grid.tsx` (report as client island)
- Test: `tests/e2e/xray.spec.ts`

**Interfaces:**
- Consumes: `ServiceTiming` values already returned by the service client (Task 5)
- Produces:
  - `XrayEntry { label: string; kind: 'server' | 'client'; serviceMs?: number; resolvedAtMs: number }`
  - `XrayProvider({ children })`, `useXray(): { enabled, toggle, clear, entries, report }`
  - `XrayReport({ label, kind, serviceMs? })` — render-nothing client leaf; server components render it to self-report when they stream in
  - `XrayToggle` (`data-testid="xray-toggle"`), `XrayPanel` (`data-testid="xray-panel"`)
- Known v1 limitation (documented in code): entries are deduped by label and accumulate across soft navigations; the panel's Clear button resets them. Plan 2 upgrades this with per-navigation traces.

- [ ] **Step 1: Write the failing test**

`tests/e2e/xray.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('x-ray panel lists streamed server sections with timings', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=50&delay_inventory=50&delay_reviews=50'
  )
  await page.getByTestId('xray-toggle').click()
  await expect(page.getByTestId('xray-panel')).toBeVisible()
  await expect(page.getByTestId('xray-panel')).toContainText('PricingPanel')
  await expect(page.getByTestId('xray-panel')).toContainText('ReviewsSection')
  await expect(page.getByTestId('xray-panel')).toContainText('server')
})

test('x-ray records client islands', async ({ page }) => {
  await page.goto('/store')
  await page.getByTestId('xray-toggle').click()
  await expect(page.getByTestId('xray-panel')).toContainText('ProductGrid')
  await expect(page.getByTestId('xray-panel')).toContainText('client')
})
```

Run: `npm run test:e2e -- xray.spec.ts`
Expected: FAIL — no xray-toggle exists.

- [ ] **Step 2: Write the X-ray components**

`components/xray/provider.tsx`:

```tsx
'use client'

// X-ray mode's registry. Server components can't hold client state, so streamed
// sections report themselves by rendering a tiny client leaf (XrayReport) that
// logs into this context on mount — turning invisible streaming into data.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type XrayEntry = {
  label: string
  kind: 'server' | 'client'
  serviceMs?: number
  resolvedAtMs: number
}

type XrayContextValue = {
  enabled: boolean
  toggle: () => void
  clear: () => void
  entries: XrayEntry[]
  report: (entry: Omit<XrayEntry, 'resolvedAtMs'>) => void
}

const XrayContext = createContext<XrayContextValue | null>(null)

export function useXray(): XrayContextValue {
  const value = useContext(XrayContext)
  if (!value) throw new Error('useXray must be used inside <XrayProvider>')
  return value
}

export function XrayProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [entries, setEntries] = useState<XrayEntry[]>([])

  // localStorage is browser-only — reading it in render would break SSR of this
  // client component (client components render on the server too!).
  useEffect(() => {
    setEnabled(localStorage.getItem('xray') === '1')
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      localStorage.setItem('xray', prev ? '0' : '1')
      return !prev
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  const report = useCallback((entry: Omit<XrayEntry, 'resolvedAtMs'>) => {
    setEntries((prev) =>
      prev.some((e) => e.label === entry.label)
        ? prev
        : [...prev, { ...entry, resolvedAtMs: Math.round(performance.now()) }]
    )
  }, [])

  const value = useMemo(
    () => ({ enabled, toggle, clear, entries, report }),
    [enabled, toggle, clear, entries, report]
  )
  return <XrayContext.Provider value={value}>{children}</XrayContext.Provider>
}
```

`components/xray/report.tsx`:

```tsx
'use client'

// Renders nothing. A server component includes <XrayReport .../> in its output;
// when that section streams in and hydrates, the mount effect fires — recording
// WHEN the section resolved and how long its service call took.
import { useEffect } from 'react'
import { useXray, type XrayEntry } from '@/components/xray/provider'

export function XrayReport({ label, kind, serviceMs }: Omit<XrayEntry, 'resolvedAtMs'>) {
  const { report } = useXray()
  useEffect(() => {
    report({ label, kind, serviceMs })
  }, [report, label, kind, serviceMs])
  return null
}
```

`components/xray/toggle.tsx`:

```tsx
'use client'

import { useXray } from '@/components/xray/provider'

export function XrayToggle() {
  const { enabled, toggle } = useXray()
  return (
    <button
      onClick={toggle}
      data-testid="xray-toggle"
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        enabled ? 'border-violet-600 bg-violet-600 text-white' : 'border-zinc-300 text-zinc-600'
      }`}
    >
      X-ray {enabled ? 'on' : 'off'}
    </button>
  )
}
```

`components/xray/panel.tsx`:

```tsx
'use client'

import { useXray } from '@/components/xray/provider'

export function XrayPanel() {
  const { enabled, entries, clear } = useXray()
  if (!enabled) return null
  return (
    <aside
      data-testid="xray-panel"
      className="fixed bottom-4 right-4 z-50 w-80 rounded-xl border border-violet-300 bg-white p-4 shadow-xl"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-violet-700">X-ray</h3>
        <button onClick={clear} className="text-xs text-zinc-500 hover:underline">
          Clear
        </button>
      </div>
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-zinc-500">
            <th className="pb-1">Component</th>
            <th className="pb-1">Kind</th>
            <th className="pb-1">Service</th>
            <th className="pb-1">Resolved</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.label}>
              <td className="py-0.5 font-mono">{entry.label}</td>
              <td className={entry.kind === 'server' ? 'text-emerald-700' : 'text-sky-700'}>
                {entry.kind}
              </td>
              <td>{entry.serviceMs !== undefined ? `${entry.serviceMs}ms` : '—'}</td>
              <td>{entry.resolvedAtMs}ms</td>
            </tr>
          ))}
        </tbody>
      </table>
    </aside>
  )
}
```

- [ ] **Step 3: Wire into the storefront**

Modify `app/store/layout.tsx` (full replacement):

```tsx
// Nested layout — persists across /store/* navigations WITHOUT re-rendering.
// Also hosts X-ray mode: the provider lives in the layout so its state survives
// navigation (layout persistence is exactly why _app-style state maps to layouts).
import Link from 'next/link'
import { XrayPanel } from '@/components/xray/panel'
import { XrayProvider } from '@/components/xray/provider'
import { XrayToggle } from '@/components/xray/toggle'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <XrayProvider>
      <div>
        <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
          <Link href="/store" className="text-xl font-semibold">
            Fieldgoods
          </Link>
          <Link href="/store/search" className="text-sm text-zinc-600 hover:text-zinc-900">
            Search
          </Link>
          <Link href="/store/cart" className="text-sm text-zinc-600 hover:text-zinc-900">
            Cart
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

Modify `app/store/products/[slug]/sections.tsx`: in each section, keep the timing and render a report. The pattern for all three (shown for `PricingPanel`; apply identically to `InventoryBadge` and `ReviewsSection` with their own labels):

```tsx
import { XrayReport } from '@/components/xray/report'
// ...
export async function PricingPanel({ slug, sim }: SectionProps) {
  const { data, timing } = await getPricing(slug, sim)
  return (
    <div data-testid="pricing-panel" className="space-y-1">
      <XrayReport label="PricingPanel" kind="server" serviceMs={timing.ms} />
      {/* ...existing markup unchanged... */}
    </div>
  )
}
```

Modify `components/product-grid.tsx`: add `<XrayReport label="ProductGrid" kind="client" />` as the first child of the returned `<div>` (import from `@/components/xray/report`).

- [ ] **Step 4: Run the e2e tests to verify they pass**

Run: `npm run test:e2e`
Expected: PASS — full suite (xray plus all previous specs; the new layout must not break them).

- [ ] **Step 5: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add X-ray mode v1 surfacing server/client split and stream timings"
```

---

### Task 12: "Show me the code" — allowlisted source API + dialog

**Files:**
- Create: `lib/source-registry.ts`, `app/api/source/[id]/route.ts`, `components/code-button.tsx`
- Modify: `app/store/page.tsx`, `app/store/products/[slug]/page.tsx`, `app/store/cart/page.tsx` (add a `CodeButton` beside each page's `<h1>`)
- Test: `tests/unit/source-registry.test.ts`, `tests/e2e/code.spec.ts`

**Interfaces:**
- Consumes: Shiki (already in dependencies), all storefront files (Tasks 6–10)
- Produces:
  - `SOURCE_FILES: Record<string, { path: string; title: string }>` with ids: `store-plp`, `store-pdp`, `pdp-sections`, `cart-page`, `cart-actions`, `add-to-cart`, `product-grid`, `services-client`; `SourceId = keyof typeof SOURCE_FILES`
  - `GET /api/source/[id]` → `{ title: string; html: string }` (Shiki-highlighted) | 404 for unknown ids
  - `CodeButton({ id, label? }: { id: SourceId; label?: string })` — client component, `data-testid="code-button-<id>"`, native `<dialog>`

- [ ] **Step 1: Write the failing tests**

`tests/unit/source-registry.test.ts`:

```ts
import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { SOURCE_FILES } from '@/lib/source-registry'

describe('source registry', () => {
  it('every registered source file exists on disk', () => {
    for (const [id, entry] of Object.entries(SOURCE_FILES)) {
      expect(existsSync(path.join(process.cwd(), entry.path)), `${id} → ${entry.path}`).toBe(
        true
      )
    }
  })
})
```

`tests/e2e/code.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('show-me-the-code opens highlighted PDP source', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=0&delay_inventory=0&delay_reviews=0'
  )
  await page.getByTestId('code-button-store-pdp').click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await expect(page.getByRole('dialog')).toContainText('Suspense')
})

test('unknown source id returns 404', async ({ page }) => {
  const res = await page.request.get('/api/source/etc-passwd')
  expect(res.status()).toBe(404)
})
```

Run: `npx vitest run tests/unit/source-registry.test.ts` — FAIL (module not found).

- [ ] **Step 2: Write the implementation**

`lib/source-registry.ts`:

```ts
// Allowlist for the source API. Ids — not paths — cross the network, so the
// endpoint cannot be used to read arbitrary files.
export type SourceEntry = { path: string; title: string }

export const SOURCE_FILES = {
  'store-plp': { path: 'app/store/page.tsx', title: 'PLP — React Query hydration' },
  'store-pdp': { path: 'app/store/products/[slug]/page.tsx', title: 'PDP — streaming page' },
  'pdp-sections': {
    path: 'app/store/products/[slug]/sections.tsx',
    title: 'PDP — streaming sections',
  },
  'cart-page': { path: 'app/store/cart/page.tsx', title: 'Cart page (Server Actions from a server component)' },
  'cart-actions': { path: 'app/store/cart/actions.ts', title: 'Cart Server Actions' },
  'add-to-cart': { path: 'components/add-to-cart-button.tsx', title: 'AddToCartButton client island' },
  'product-grid': { path: 'components/product-grid.tsx', title: 'ProductGrid — useSuspenseInfiniteQuery' },
  'services-client': { path: 'lib/services.ts', title: 'Server-only service client' },
} as const satisfies Record<string, SourceEntry>

export type SourceId = keyof typeof SOURCE_FILES
```

`app/api/source/[id]/route.ts`:

```ts
// Serves highlighted source for "Show me the code". Reads from disk at request
// time — fine on the Node server this site runs on (README notes the repo must
// be present, i.e. don't deploy this route to a serverless bundle without it).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { codeToHtml } from 'shiki'
import { SOURCE_FILES } from '@/lib/source-registry'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entry = SOURCE_FILES[id as keyof typeof SOURCE_FILES]
  if (!entry) return Response.json({ error: 'unknown source id' }, { status: 404 })

  const code = await readFile(path.join(process.cwd(), entry.path), 'utf8')
  const html = await codeToHtml(code, {
    lang: entry.path.endsWith('.tsx') ? 'tsx' : 'ts',
    theme: 'github-dark',
  })
  return Response.json({ title: entry.title, html }, { headers: { 'cache-control': 'no-store' } })
}
```

`components/code-button.tsx`:

```tsx
'use client'

// "Show me the code" — the storefront doubling as browsable reference code.
import { useRef, useState } from 'react'
import type { SourceId } from '@/lib/source-registry'

export function CodeButton({ id, label = 'Show me the code' }: { id: SourceId; label?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [content, setContent] = useState<{ title: string; html: string } | null>(null)

  async function open() {
    if (!content) {
      const res = await fetch(`/api/source/${id}`)
      if (res.ok) setContent(await res.json())
    }
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        onClick={open}
        data-testid={`code-button-${id}`}
        className="text-xs font-medium text-violet-700 hover:underline"
      >
        {'</>'} {label}
      </button>
      <dialog
        ref={dialogRef}
        className="max-h-[80vh] w-[min(56rem,90vw)] rounded-xl p-0 backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
          <span className="text-sm font-medium">{content?.title}</span>
          <button onClick={() => dialogRef.current?.close()} className="text-sm text-zinc-500">
            Close
          </button>
        </div>
        <div
          className="overflow-auto p-4 text-sm [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: content?.html ?? '' }}
        />
      </dialog>
    </>
  )
}
```

Wire buttons in (same pattern in all three pages — shown for the PDP; use `id="store-plp"` on the PLP and `id="cart-page"` on the cart page):

```tsx
import { CodeButton } from '@/components/code-button'
// ... replace the PDP's <h1> line with:
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <CodeButton id="store-pdp" />
        </div>
```

- [ ] **Step 3: Run the tests to verify they pass**

Run: `npx vitest run && npm run test:e2e -- code.spec.ts`
Expected: PASS.

- [ ] **Step 4: Typecheck and commit**

Run: `npm run typecheck` — exit 0.

```bash
git add -A
git commit -m "feat: add show-me-the-code source API and dialog"
```

---

### Task 13: Dogfooded error handling, dev-mode banner, README

**Files:**
- Create: `app/error.tsx`, `app/global-error.tsx`, `app/not-found.tsx`, `components/section-error-boundary.tsx`, `components/dev-mode-banner.tsx`, `README.md`
- Modify: `app/store/products/[slug]/page.tsx` (wrap the reviews Suspense in the boundary), `app/store/layout.tsx` (banner above header)
- Test: `tests/e2e/errors.spec.ts`

**Interfaces:**
- Consumes: failure injection via `?fail_reviews=1` (Tasks 3–5, already plumbed)
- Produces:
  - `SectionErrorBoundary({ fallback, children })` — client class component
  - Reviews failure fallback: `data-testid="reviews-error"`
  - Global `error.tsx` / `global-error.tsx` / `not-found.tsx` with annotated teaching comments
  - `DevModeBanner` — server component, renders only when `NODE_ENV !== 'production'`
  - `README.md` with quickstart + dev-vs-prod caching note

- [ ] **Step 1: Write the failing test**

`tests/e2e/errors.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('a failing reviews service is contained by its section boundary', async ({ page }) => {
  await page.goto(
    '/store/products/aurora-desk-lamp?delay_pricing=0&delay_inventory=0&delay_reviews=0&fail_reviews=1'
  )
  await expect(page.getByTestId('reviews-error')).toBeVisible()
  // The failure did NOT take down the rest of the page:
  await expect(page.getByTestId('pricing-panel')).toBeVisible()
  await expect(page.getByTestId('add-to-cart')).toBeVisible()
})

test('unknown product renders the custom 404 page', async ({ page }) => {
  await page.goto('/store/products/does-not-exist?delay_products=0')
  await expect(page.getByText('Page not found')).toBeVisible()
})
```

Run: `npm run test:e2e -- errors.spec.ts`
Expected: FAIL — no `reviews-error` testid, default 404 page.

- [ ] **Step 2: Write the implementation**

`components/section-error-boundary.tsx`:

```tsx
'use client'

// React error boundaries are STILL class components — and they must be client
// components. When a streamed server section throws, the error travels down the
// stream and the nearest client boundary catches it. Place the boundary OUTSIDE
// the <Suspense> it protects: ErrorBoundary > Suspense > async section.
import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }
type State = { hasError: boolean }

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
```

Modify `app/store/products/[slug]/page.tsx` — wrap the reviews section:

```tsx
import { SectionErrorBoundary } from '@/components/section-error-boundary'
// ... replace the reviews <Suspense> block with:
        <SectionErrorBoundary
          fallback={
            <p data-testid="reviews-error" className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              Reviews are unavailable right now — the rest of the page is unaffected.
            </p>
          }
        >
          <Suspense fallback={<ReviewsSkeleton />}>
            <ReviewsSection slug={slug} sim={sim.reviews} />
          </Suspense>
        </SectionErrorBoundary>
```

`app/not-found.tsx`:

```tsx
// Rendered by notFound() anywhere in the app (and for unmatched URLs).
// Replaces pages/404.tsx.
import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="space-y-4 py-16 text-center">
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-zinc-600">That page doesn’t exist — maybe the product was renamed?</p>
      <Link href="/store" className="underline">
        Back to the store
      </Link>
    </section>
  )
}
```

`app/error.tsx`:

```tsx
'use client'

// Route-segment error boundary — replaces pages/_error.tsx, but scoped: only
// this segment's subtree is replaced, and reset() re-renders it. Must be a
// client component (it holds interactive recovery state).
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-zinc-500">Digest: {error.digest ?? 'n/a'}</p>
      <button onClick={reset} className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
        Try again
      </button>
    </section>
  )
}
```

`app/global-error.tsx`:

```tsx
'use client'

// Catches errors thrown by the ROOT layout itself. Because it replaces the
// entire document it must render its own <html> and <body>.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'sans-serif', padding: '4rem', textAlign: 'center' }}>
        <h1>Something went badly wrong</h1>
        <button onClick={reset}>Try again</button>
      </body>
    </html>
  )
}
```

`components/dev-mode-banner.tsx`:

```tsx
// Dev-vs-prod honesty: the Full Route Cache is disabled under `next dev` and the
// client Router Cache behaves differently. A server component reading NODE_ENV —
// the check runs on the server and ships no JS.
export function DevModeBanner() {
  if (process.env.NODE_ENV === 'production') return null
  return (
    <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
      Dev mode: some caching demos behave differently here. For true caching semantics run{' '}
      <code>npm run build &amp;&amp; npm start</code>.
    </p>
  )
}
```

Modify `app/store/layout.tsx`: render `<DevModeBanner />` as the first child inside the outer `<div>` (import from `@/components/dev-mode-banner`).

`README.md`:

````markdown
# App Router Field Guide

An interactive site for learning the Next.js App Router, built for a team
migrating a large ecommerce app off the Pages Router. The demo store under
`/store` is itself the reference implementation: server-first pages, streaming
Suspense sections, Server Actions, and React Query coexistence — running on the
same Next.js / React / React Query versions we use in production.

## Quickstart

```bash
npm install
npm run dev        # http://localhost:3000
```

> **Caching honesty:** several App Router caches are disabled or altered under
> `next dev`. For true caching behavior use `npm run build && npm start`.

## Scripts

- `npm run dev` / `npm run build` / `npm start`
- `npm test` — unit tests (Vitest)
- `npm run test:e2e` — e2e tests (Playwright; first run: `npx playwright install chromium`)
- `npm run lint` / `npm run typecheck`

## Poking at the demos

- Every mock microservice accepts `?delay_<service>=<ms>` and `?fail_<service>=1`
  on storefront URLs, e.g. `/store/products/aurora-desk-lamp?delay_reviews=4000&fail_pricing=1`.
- Toggle **X-ray mode** (top right of the store) to see which parts of the tree
  are server vs client and when each streamed section resolved.
- Click **</> Show me the code** on any page to read its annotated source.
````

- [ ] **Step 3: Run the full verification suite**

Run: `npm run lint && npm run typecheck && npm test && npm run test:e2e`
Expected: all PASS. Fix anything that fails before committing.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: add error boundaries, dev-mode banner, and README"
```

---

## After this plan

Plan 1 delivers a working, tested site: landing stub + full demo storefront with X-ray, show-me-the-code, and failure-injection demos. Subsequent plans (each written after the previous one ships, so they can reference real code):

- **Plan 2 — The Boundary Journey:** `pages/legacy/*` (stage 0: `getInitialProps` + React Query), `app/journey/stage-[n]/*` (stages 1–2), comparison dashboard with per-stage bundle/hydration/RSC-payload metrics, X-ray v2 (per-navigation traces).
- **Plan 3 — Labs:** Boundary Explorer, Cache Lab (+ CDN lens, cached service variants), RSC Payload Inspector.
- **Plan 4 — Curriculum:** MDX pipeline, course shell with progress, 12 modules, drill/quiz engine, full landing page.
