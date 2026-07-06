# App Router Learning Site — Design

**Date:** 2026-07-06
**Status:** Approved by Scott (design review conducted interactively; all sections approved)

## Purpose

An interactive learning website that teaches engineers — 5+ years of React/Next.js experience,
deep Pages Router familiarity, minimal App Router / Server Components knowledge — everything
they need for the organization's migration from the Pages Router to the App Router.

The content is fully tailored to the team's real stack and migration strategy:

- Large-scale ecommerce app behind **Fastly** CDN
- **TanStack React Query 5.83** as the primary data-fetching layer
- **Next.js 15.5.18**, **React 19.2.6**
- Microservice architecture for page data
- Minimal SSR today (bots + a few performance-critical components), data via `getInitialProps`
  on some routes
- **Migration strategy: start with the client boundary as high as possible (almost everything
  a client component), then progressively push the boundary down.** This strategy is a
  first-class theme of the site (see "The Boundary Journey").

## Success criteria

An engineer who works through the site can:

1. Explain the App Router mental model and how it differs from the Pages Router.
2. Place `'use client'` boundaries deliberately and push them down safely (composition patterns,
   serialization rules, what breaks and why).
3. Migrate a `getInitialProps` route to App Router idioms, including the React Query
   coexistence patterns (`prefetchQuery` → `HydrationBoundary`, and knowing which queries
   should stay client-side).
4. Reason about the App Router caching layers and how they interact with Fastly
   (`Cache-Control` emission, tags vs surrogate keys, streaming vs CDN cacheability).
5. Use streaming/Suspense/`loading.tsx`, Server Actions, and `generateMetadata` appropriately.
6. Follow the team's incremental migration playbook (both routers coexisting in one app).

## Decisions made during design review

| Decision | Choice |
| --- | --- |
| Platform | The site itself is a **Next.js App Router app** (dogfooding; demos are real server behavior; the site's source is reference code) |
| Version target | **Next 15.5 semantics** with clearly-marked **"What changes in Next 16" callouts** (Cache Components / `'use cache'`, `middleware` → `proxy` rename) |
| Interactivity | All four kinds: live demos, visual explorers, annotated before/after code, drills & quizzes |
| Tailoring | Fully tailored: running example is a fictional ecommerce storefront; React Query 5 and Fastly-style CDN semantics woven through every module |
| Structure | **Course + storefront hybrid**: linear curriculum wrapped around a working demo storefront, plus shared labs |

## Architecture

### Stack

- Next.js **15.5.x** (App Router primary; a few `pages/` routes for the coexistence demo)
- React **19.2.x**, TypeScript, Tailwind CSS
- TanStack React Query **5.83.x** in the storefront where it belongs
- MDX for curriculum modules (interactive components embed directly in prose)
- Shiki for syntax-highlighted before/after diffs
- No database, no auth. Mock microservices are route handlers over in-memory catalog data.
- Cart state in a cookie (doubles as the server-side-state teaching example)
- Progress/quiz scores in `localStorage`

### Route map

```
app/
  layout.tsx                      Root layout (nav, theme)
  page.tsx                        Landing: the pitch, learning path, migration strategy overview
  learn/
    layout.tsx                    Course shell: sidebar, per-module progress
    [module]/page.tsx             12 MDX-driven modules (see Curriculum)
  store/
    layout.tsx                    Storefront shell (annotated)
    page.tsx                      Product listing (PLP)
    products/[slug]/page.tsx      Product detail (PDP) — streaming showcase:
                                  pricing/inventory/reviews behind separate Suspense boundaries
    search/page.tsx               searchParams + dynamic rendering
    cart/page.tsx                 Server Actions + React Query coexistence
  journey/
    page.tsx                      The Boundary Journey comparison dashboard (stage slider,
                                  per-stage metrics)
    stage-[n]/products/[slug]/    The same PDP at migration stages 1–3 (stage 0 lives in
      page.tsx                    pages/legacy/)
  labs/
    boundary-explorer/            Interactive component-tree boundary tool
    cache-lab/                    Cache-layer timeline + CDN lens
    rsc-inspector/                RSC (flight) payload inspector
  api/services/                   Mock microservices: products, pricing, inventory, reviews,
                                  cart — each with configurable artificial latency and
                                  failure injection
pages/
  legacy/products/[slug].tsx      The SAME PDP built with getInitialProps + React Query
                                  (journey stage 0 and the "before" half of code diffs)
  legacy/search.tsx               The SAME search page in the Pages Router
```

`pages/legacy/*` runs in the same app as `app/*` — live, clickable proof of the
incremental-migration coexistence story.

### Mock microservices

Route handlers under `app/api/services/*` that mirror the team's microservice-per-concern
architecture (product catalog, pricing, inventory, reviews, cart). Each supports:

- Configurable artificial latency (so streaming and waterfalls are visible)
- Failure injection (so error boundaries can be demonstrated live)
- Cache-status response headers consumed by X-ray mode and the Cache Lab

## Signature features

### 1. The Boundary Journey

The same product detail page implemented at four real, running migration stages, directly
mirroring the team's strategy:

- **Stage 0 — Pages Router original.** `pages/legacy/products/[slug].tsx` with
  `getInitialProps` + React Query, as the app works today.
- **Stage 1 — Boundary at the top.** App Router route whose page is one big `'use client'`
  component; React Query untouched. Teaches: what you gain immediately (layouts,
  `loading.tsx`, coexistence, `next/navigation`) and what you don't yet (bundle unchanged,
  no RSC benefits). Client components still SSR.
- **Stage 2 — Boundary mid-level.** Shell and static sections become server components;
  initial data moves to RSC fetching with `prefetchQuery` → `HydrationBoundary`; interactive
  islands stay client.
- **Stage 3 — Boundary at the leaves.** Server-first with small client islands (add-to-cart,
  gallery, quantity picker), streaming Suspense sections, full caching story.

A **stage slider / comparison dashboard** flips between stages while showing measured
metrics per stage: client-bundle size, server/client tree split, hydration cost, RSC payload
size. The payoff of each boundary push is measured, not asserted.

`/store` itself is the stage-3 end state — the aspirational reference implementation.

### 2. X-ray mode

A toggleable overlay available on every storefront/journey page showing:

- Which parts of the rendered tree are server vs client components
- Per-mock-service fetch timings for the current request
- Cache hit/miss per layer (from response/collector data)
- When each Suspense boundary resolved (client-observed timestamps)

Implementation: a per-request server-side trace collector around mock-service calls,
serialized into the page; light component tagging via wrappers; client-side observation for
streaming/hydration timing; rendered as an overlay panel.

### 3. "Show me the code"

Every storefront page and significant component has a button that opens its annotated source
inline (source embedded at build time). The storefront doubles as browsable reference code.

## Curriculum

Twelve MDX modules. Shared anatomy: **concept prose → live storefront/lab embed →
Pages-vs-App code diff → 3–5 drills.**

1. **Why App Router** — what it unlocks (streaming, smaller client bundles, layouts,
   Server Actions, colocation); the team's migration in one picture (boundary-pushing
   strategy previewed).
2. **The mental model shift** — route-level data + hydrate-everything → a component tree
   split across server and client, with the split as a dial you control.
3. **Routing, layouts & file conventions** — pages→app mapping table (`_app`/`_document` →
   root layout, `pages/api` → route handlers, `next/router` → `next/navigation`); persistent
   layouts; `loading.tsx`/`error.tsx`/`not-found.tsx`; route groups; parallel & intercepted
   routes (product quick-view modal).
4. **Server Components & the client boundary** — `'use client'` marks an entry point, not
   "client-only"; client components still SSR; serialization rules for props crossing the
   boundary; **server children inside client parents** as the boundary-pushing workhorse
   pattern.
5. **Hooks & client patterns** — `next/navigation` vs `next/router` API differences;
   `useSearchParams` Suspense/CSR-bailout behavior; context providers under a high boundary;
   third-party library handling.
6. **Data fetching** — `getInitialProps` → async server components; request memoization;
   waterfalls, `Promise.all`, preload pattern; **React Query coexistence per journey stage**
   (stage 1: works exactly as today; stage 2+: `prefetchQuery`/`HydrationBoundary`; end
   state: which queries rightfully stay client — mutations, infinite scroll, polling,
   shared client cache).
7. **Caching & your CDN** — the four caches in 15.5 (request memoization, Data Cache, Full
   Route Cache, Router Cache); default behaviors; `revalidateTag`/`revalidatePath`; **Fastly
   interplay**: emitted `Cache-Control`/`CDN-Cache-Control` headers, tags vs surrogate-key
   purging, streaming vs CDN cacheability; dev-vs-prod cache behavior differences. Next 16
   callout: Cache Components, `'use cache'`, `cacheLife`/`cacheTag`.
8. **Streaming, Suspense & loading UI** — the PDP streaming showcase; boundary placement and
   sequencing; `loading.tsx` vs inline Suspense; PPR callout.
9. **Mutations: Server Actions & Route Handlers** — add-to-cart implemented both ways;
   `useActionState`/`useOptimistic`; progressive enhancement; when BFF-style route handlers
   remain the right tool given the microservice architecture.
10. **SEO, metadata & bot rendering** — `generateMetadata`; how streaming interacts with
    bots; the inversion of the current SSR-for-bots-only pattern (everything server-renders
    by default now); structured data.
11. **The Boundary Journey (capstone)** — stages 0→3 live with measured metrics; heuristics
    for what to push down and when; how to sequence pushes safely in a large codebase.
12. **Migration playbook** — route-by-route ordering; coexistence mechanics; sharing code
    between routers during migration; gotchas checklist (`_app` logic → providers, router
    events, error pages, middleware, dynamic imports); performance-regression watch list.

Next 16 callouts appear inline as visually distinct "What changes in Next 16" asides wherever
15.5 semantics will change, concentrated in modules 3, 7, and 12.

## Labs

### Boundary Explorer

Interactive component tree of the PDP. Toggle `'use client'` on any node; the tool recomputes:

- Which subtree becomes client code and estimated client-JS added
- **What breaks**: async component below a client boundary, non-serializable props crossing
  the boundary — each violation flagged with an explanation
- Presets matching journey stages 1/2/3

Implementation: client-side simulation over a static model of the real PDP component tree
annotated with sizes (taken from actual bundle stats) and hook usage. No live compilation.

### Cache Lab

Choose a route configuration (static, dynamic, `revalidate: N`, tagged). Fire requests and
watch a timeline of hits/misses across each cache layer. Trigger `revalidateTag` /
`revalidatePath` and see which layers invalidate. The **CDN lens** shows the emitted
`Cache-Control`/`CDN-Cache-Control` headers — what Fastly would see — and why tag
revalidation is not a surrogate-key purge.

Caveat handled in design: several caches behave differently under `next dev`. The site
detects dev mode and shows a banner where semantics differ; README recommends
`next build && next start` for the caching modules.

### RSC Payload Inspector

Fetches a storefront route's actual flight payload and pretty-prints it with annotations:
server-rendered tree segments, client-component references, props crossing the boundary.
Shows what actually travels over the wire on a navigation.

## Drills & progress

- Each module ends with 3–5 scenario cards: "server or client?", predict-the-behavior,
  spot-the-bug (serialization violations, boundary mistakes)
- Instant feedback with explanations
- Scores and module completion persist to `localStorage`; progress surfaces in the course
  sidebar

## Error handling (dogfooded)

- The site implements `error.tsx`, `not-found.tsx`, `global-error.tsx` as annotated teaching
  examples
- Mock services' failure injection lets engineers watch an error boundary catch a failing
  streamed section live

## Testing

- Typecheck + ESLint
- Playwright smoke suite for load-bearing behaviors: PDP streams progressively; all journey
  stages render; Cache Lab hit/miss timeline is correct; quizzes score correctly
- Vitest units only for pure logic: quiz engine, boundary-explorer simulation model

## Deployment & distribution

- Git repo; `npm run dev` for development, `next build && next start` for true caching
  semantics
- Nothing Vercel-specific; optionally deployable to Vercel later for a shared team URL
- README with quickstart and a suggested learning path

## Out of scope

- Authentication / user accounts (progress is per-browser via localStorage)
- Real Fastly integration (CDN behavior is taught via emitted headers + the CDN lens
  visualization)
- A real database or real product data
- CMS/authoring workflow beyond MDX files in the repo
- i18n
- Covering Next.js versions beyond 15.5 semantics + Next 16 callouts

## Risks & mitigations

- **Dev-vs-prod cache divergence** could mislead learners → dev-mode banners + README
  guidance (see Cache Lab).
- **Bundle-size numbers in Boundary Explorer are estimates** → derive from real bundle
  stats where possible and label estimates honestly.
- **Next 16 drift**: content targets 15.5 by decision; callouts isolate the volatile
  surface (caching, middleware rename) so updates are localized.
- **Scope**: this is a large build. The curriculum's module anatomy is uniform, so modules
  can ship incrementally; storefront + journey + labs are independent units behind the
  shared mock-services layer.
