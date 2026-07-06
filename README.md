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
