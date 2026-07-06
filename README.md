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
