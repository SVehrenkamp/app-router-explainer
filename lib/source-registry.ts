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
  'legacy-pdp': {
    path: 'pages/legacy/products/[slug].tsx',
    title: 'Stage 0 — Pages Router PDP (getInitialProps + React Query)',
  },
  'legacy-search': {
    path: 'pages/legacy/search.tsx',
    title: 'Stage 0 — Pages Router search (full-reload form)',
  },
  'journey-stage-1': {
    path: 'components/journey/stage1-pdp.tsx',
    title: "Stage 1 — one 'use client' at the top (React Query untouched)",
  },
  'journey-stage-2': {
    path: 'app/journey/stage-2/products/[slug]/page.tsx',
    title: 'Stage 2 — server shell + HydrationBoundary + client islands',
  },
  'journey-stage-3': {
    path: 'app/journey/stage-3/products/[slug]/page.tsx',
    title: 'Stage 3 — server-first streaming PDP (the end state)',
  },
  'journey-dashboard': {
    path: 'app/journey/page.tsx',
    title: 'Boundary Journey dashboard',
  },
} as const satisfies Record<string, SourceEntry>

export type SourceId = keyof typeof SOURCE_FILES
