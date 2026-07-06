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
