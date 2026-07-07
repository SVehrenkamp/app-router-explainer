// Curriculum registry — the single source of truth for the course sidebar,
// the landing learning path, and the drill decks. Twelve modules in spec
// order; modules 1-3 ship with Plan 4A, the rest are registered as planned so
// the learning path is an honest roadmap, not vaporware links.
export type ModuleStatus = 'available' | 'planned'

export type Drill = {
  id: string
  type: 'server-or-client' | 'predict' | 'spot-the-bug'
  prompt: string
  options: string[]
  answerIndex: number
  explanation: string
}

export type CurriculumModule = {
  slug: string
  number: number
  title: string
  summary: string
  status: ModuleStatus
  drills: Drill[]
}

export const MODULES: CurriculumModule[] = [
  {
    slug: 'why-app-router',
    number: 1,
    title: 'Why the App Router',
    summary: 'What it unlocks, and the migration in one picture.',
    status: 'available',
    drills: [
      {
        id: 'm1-layouts',
        type: 'predict',
        prompt:
          'You navigate from /store to /store/search. What happens to the storefront header rendered by the store layout?',
        options: [
          'It re-renders, like _app did on every navigation',
          'It persists — DOM and state untouched; only the page below it swaps',
          'It unmounts briefly and remounts after hydration',
        ],
        answerIndex: 1,
        explanation:
          'Nested layouts persist across navigations within their segment. This is the structural upgrade over _app, which re-ran on every route change — try it live: the X-ray toggle state survives store navigation.',
      },
      {
        id: 'm1-streaming',
        type: 'predict',
        prompt:
          'On the stage-3 PDP, the reviews service takes 3 seconds. When does the shopper see the product name and price?',
        options: [
          'After ~3s — the page waits for the slowest service',
          'Immediately — reviews stream in later behind their own Suspense boundary',
          'After hydration completes on the client',
        ],
        answerIndex: 1,
        explanation:
          'Each Suspense section streams independently; a slow service delays only its own section. In the getInitialProps world (stage 0), the same 3s service gated the entire page.',
      },
      {
        id: 'm1-bundle',
        type: 'predict',
        prompt:
          'A component with no interactivity and no hooks is rendered by an App Router page. By default, how much of its code ships to the browser?',
        options: [
          'All of it — React always hydrates everything',
          'None of it — server components ship their OUTPUT, not their code',
          'Only the JSX, not the imports',
        ],
        answerIndex: 1,
        explanation:
          "Server components render to the flight payload; their source (and their imports — date libraries, markdown parsers, SDKs) never enters the client bundle. Client JS is opt-in via 'use client'.",
      },
    ],
  },
  {
    slug: 'mental-model',
    number: 2,
    title: 'The mental model shift',
    summary: 'From route-level data + hydrate-everything to a tree split you control.',
    status: 'available',
    drills: [
      {
        id: 'm2-card',
        type: 'server-or-client',
        prompt:
          'ProductCard renders a link, an emoji, a name, and a formatted price. Server or client?',
        options: [
          'Server component',
          'Client component',
          'Must be client because it renders a <Link>',
        ],
        answerIndex: 0,
        explanation:
          'Nothing here needs the client: no hooks, no handlers, no browser APIs. <Link> works fine rendered from a server component — the interactivity lives inside next/link, not your component.',
      },
      {
        id: 'm2-cart-btn',
        type: 'server-or-client',
        prompt: 'AddToCartButton uses useActionState to show pending/added states. Server or client?',
        options: ['Server component', 'Client component', 'Either — hooks work in both'],
        answerIndex: 1,
        explanation:
          'Hooks are client-only. This is the canonical small island: one interactive leaf on an otherwise-server page, wired to a Server Action.',
      },
      {
        id: 'm2-services',
        type: 'server-or-client',
        prompt:
          "lib/services.ts (the typed microservice client) imports 'server-only'. What happens if a client component imports it?",
        options: [
          'It works, but the fetches run in the browser',
          'The build fails with an explicit error',
          'It silently tree-shakes the import away',
        ],
        answerIndex: 1,
        explanation:
          "The 'server-only' package turns an accidental boundary crossing into a build error — the guardrail that keeps data plumbing (and secrets) out of client bundles. Poison your imports on purpose.",
      },
    ],
  },
  {
    slug: 'routing-layouts',
    number: 3,
    title: 'Routing, layouts & file conventions',
    summary: 'pages→app mapping, persistent layouts, loading/error/not-found files.',
    status: 'available',
    drills: [
      {
        id: 'm3-mapping',
        type: 'predict',
        prompt: 'Where does the code that lived in _app.tsx + _document.tsx go in the App Router?',
        options: [
          'app/layout.tsx (the root layout renders <html>/<body> and wraps every route)',
          'app/page.tsx',
          'middleware.ts',
        ],
        answerIndex: 0,
        explanation:
          'The root layout absorbs both: document shell (_document) and app-wide wrapper (_app). Unlike _app it is a server component and does not re-render on navigation — providers move to a client child (see app/providers.tsx).',
      },
      {
        id: 'm3-loading',
        type: 'predict',
        prompt: 'What does adding loading.tsx next to a page.tsx do?',
        options: [
          'Nothing without extra configuration',
          'Wraps the page in an automatic Suspense boundary with your fallback',
          'Adds a route-level spinner only for client navigations',
        ],
        answerIndex: 1,
        explanation:
          'loading.tsx IS a Suspense boundary — the shell flushes instantly with the fallback while the page resolves, for both initial loads and navigations. The Pages Router had no equivalent.',
      },
      {
        id: 'm3-handler-bug',
        type: 'spot-the-bug',
        prompt:
          "A server layout renders <ProductGrid onSelect={(p) => track(p)} /> where ProductGrid is 'use client'. What breaks?",
        options: [
          'Nothing — functions are values like any other',
          'Runtime error: functions cannot cross the server→client boundary',
          'The handler runs on the server instead of the client',
        ],
        answerIndex: 1,
        explanation:
          'Props crossing into a client component must be serializable; functions are not (Server Actions are the one blessed exception). Move the handler into the client component, or pass data and let the client wire its own events.',
      },
    ],
  },
  {
    slug: 'server-components-boundary',
    number: 4,
    title: 'Server Components & the client boundary',
    summary: "'use client' as an entry point; composition patterns; serialization.",
    status: 'available',
    drills: [
      {
        id: 'm4-import',
        type: 'spot-the-bug',
        prompt:
          "A 'use client' file imports PricingPanel (an async server component) and renders it. What happens?",
        options: [
          'It works — imports are imports',
          'It breaks: importing it from a client file makes it client code, and async client components are invalid',
          'Next silently renders it on the server anyway',
        ],
        answerIndex: 1,
        explanation:
          "The boundary follows the IMPORT graph, not the render tree. Importing anything from a 'use client' file drags it into the client bundle — an async component there is an error. Pass it as children instead.",
      },
      {
        id: 'm4-children',
        type: 'predict',
        prompt:
          'A client component receives <ReviewsSection /> (server) via its children prop and renders {children}. Does ReviewsSection ship to the browser?',
        options: [
          'Yes — anything a client component renders becomes client code',
          'No — it rendered on the server; the client component receives its OUTPUT through the slot',
          'Only its props ship',
        ],
        answerIndex: 1,
        explanation:
          'This is the composition workhorse: server children flow THROUGH client parents as already-rendered output. The client shell holds interactivity; the content costs zero client JS. It is how Providers wraps the whole app without dragging it client-side.',
      },
      {
        id: 'm4-serialize',
        type: 'server-or-client',
        prompt:
          'Which of these can legally cross from a server component into a client component as a prop?',
        options: [
          'A Date instance',
          'A plain object with strings and numbers — or a Server Action',
          'A class instance with methods',
        ],
        answerIndex: 1,
        explanation:
          'Boundary props must survive serialization: JSON-safe values cross; Dates, Maps, class instances, and functions do not — except Server Actions, which cross as callable references by design.',
      },
    ],
  },
  {
    slug: 'hooks-client-patterns',
    number: 5,
    title: 'Hooks & client patterns',
    summary: 'next/navigation, useSearchParams bailouts, providers under a high boundary.',
    status: 'available',
    drills: [
      {
        id: 'm5-router-import',
        type: 'spot-the-bug',
        prompt:
          "A freshly-migrated app/ component imports useRouter from 'next/router' and calls router.query. What happens?",
        options: [
          'Works — the routers share an API',
          'Runtime error: next/router only works in the Pages Router; app/ code uses next/navigation, and query moved to useSearchParams/params',
          'It works but logs a deprecation warning',
        ],
        answerIndex: 1,
        explanation:
          "next/router throws outside pages/. In app/ the API splits: useRouter (navigation methods only), usePathname, useSearchParams, and route params via the params prop — router.query and router events are gone.",
      },
      {
        id: 'm5-bailout',
        type: 'predict',
        prompt:
          'A statically-rendered page renders a client component calling useSearchParams without a Suspense boundary above it. What does Next do?',
        options: [
          'Nothing special — search params are always available',
          'It bails the whole page out to client-side rendering (and the build warns), because search params are unknowable at prerender time',
          'It throws at build time',
        ],
        answerIndex: 1,
        explanation:
          'On a static page, useSearchParams cannot know its values at build — without a Suspense boundary to isolate it, the entire page deopts to CSR. Wrap the reading component in <Suspense> so only that island waits for the client.',
      },
      {
        id: 'm5-provider',
        type: 'server-or-client',
        prompt:
          'QueryClientProvider must wrap the whole app. Does that force the whole app to be client code?',
        options: [
          'Yes — providers at the top mean a client boundary at the top',
          'No — the provider is a client component, but the app flows through it as server-rendered children',
          'Only if any descendant calls useQuery',
        ],
        answerIndex: 1,
        explanation:
          'app/providers.tsx is exactly this: a thin client wrapper whose children remain server components. Context is readable by any client descendant, while everything else stays server-side. A high provider is fine; a high boundary is the thing to avoid.',
      },
    ],
  },
  {
    slug: 'data-fetching',
    number: 6,
    title: 'Data fetching',
    summary: 'getInitialProps → async server components; React Query coexistence per stage.',
    status: 'available',
    drills: [
      {
        id: 'm6-memo',
        type: 'predict',
        prompt:
          'generateMetadata and the page component both call getProductDetail(slug) with the same URL during one request. How many network calls happen?',
        options: [
          'Two — they are separate functions',
          'One — request memoization dedupes identical fetches within a single render pass',
          'Zero — metadata reads the page cache',
        ],
        answerIndex: 1,
        explanation:
          'fetch calls with the same URL and options are memoized per request in the App Router. That is why the real PDP fetches product data in generateMetadata AND the page body without paying twice — no manual plumbing.',
      },
      {
        id: 'm6-waterfall',
        type: 'spot-the-bug',
        prompt:
          'A server component does: const pricing = await getPricing(slug); const inventory = await getInventory(slug). What is wrong?',
        options: [
          'Nothing — server fetches are free',
          'A sequential waterfall: inventory waits for pricing for no reason. Promise.all or separate Suspense sections fix it',
          'Server components may only await one fetch',
        ],
        answerIndex: 1,
        explanation:
          'Server-side fetching removes client waterfalls but you can still hand-build one with sequential awaits. Start independent requests together (Promise.all), or give each its own Suspense section so they stream independently — the stage-3 PDP does the latter.',
      },
      {
        id: 'm6-stay-client',
        type: 'server-or-client',
        prompt:
          'After migrating to server-first pages, which query rightfully STAYS in client-side React Query?',
        options: [
          'The product detail for the current page',
          'Infinite-scroll pagination, polling, and mutations with optimistic UI',
          'None — React Query is removed at stage 3',
        ],
        answerIndex: 1,
        explanation:
          'Server components own initial page data; React Query keeps what is genuinely client-interactive: paginate-on-click (our PLP grid), polling, shared client caches, and mutation state. Coexistence is the end state, not a transition cost.',
      },
    ],
  },
  {
    slug: 'caching-cdn',
    number: 7,
    title: 'Caching & your CDN',
    summary: 'The four caches, revalidation, and the Fastly interplay.',
    status: 'available',
    drills: [
      {
        id: 'm7-layers',
        type: 'predict',
        prompt:
          "revalidateTag('products') runs after a catalog update. Which copies of the data become stale-and-refreshable?",
        options: [
          'Every copy everywhere, including what Fastly holds',
          "Next's server-side caches (Data Cache / Full Route Cache entries using that tag) — Fastly's copy is untouched",
          'Only the browser Router Cache',
        ],
        answerIndex: 1,
        explanation:
          "Tags are a Next-internal index; revalidateTag is not a surrogate-key purge. Fastly keeps serving its copy until the emitted Cache-Control expires (or you purge via Fastly's own API). Two systems, two invalidation stories — plan both.",
      },
      {
        id: 'm7-nostore',
        type: 'predict',
        prompt:
          "A server component uses fetch(url, { cache: 'no-store' }). What does that change for the ROUTE's cacheability?",
        options: [
          'Nothing — fetch options are local',
          'The route becomes dynamically rendered: an uncached fetch is request-time work, so the Full Route Cache no longer applies',
          'It only disables the browser cache',
        ],
        answerIndex: 1,
        explanation:
          'Caching decisions compose upward: a no-store fetch marks the render as request-bound, which opts the route out of static prerendering. This is how our PDP stays dynamic — pricing and inventory are no-store by design.',
      },
      {
        id: 'm7-dev',
        type: 'spot-the-bug',
        prompt:
          'You verify caching behavior with `next dev`, see fresh data on every reload, and conclude revalidate:300 is broken. What went wrong?',
        options: [
          'Nothing — revalidate is broken in 15.5',
          'Dev mode disables or alters several caches; only `next build && next start` shows production semantics',
          'revalidate only works on Vercel',
        ],
        answerIndex: 1,
        explanation:
          'The dev server prioritizes freshness over cache fidelity — Full Route Cache and parts of the Data Cache behave differently. This site shows a dev-mode banner for exactly that reason. Always validate caching against a production build.',
      },
    ],
  },
  {
    slug: 'streaming-suspense',
    number: 8,
    title: 'Streaming, Suspense & loading UI',
    summary: 'Boundary placement, sequencing, and the PDP showcase.',
    status: 'available',
    drills: [
      {
        id: 'm8-placement',
        type: 'predict',
        prompt:
          'The PDP wraps pricing, inventory, and reviews in ONE shared Suspense boundary instead of three. Reviews takes 3s. What renders at t=0.5s?',
        options: [
          'Pricing and inventory, with a reviews skeleton',
          'One combined skeleton — the shared boundary resolves only when ALL three finish',
          'Nothing until hydration',
        ],
        answerIndex: 1,
        explanation:
          'A Suspense boundary resolves as a unit: its slowest child gates everything inside it. Per-section boundaries are why the stage-3 PDP shows price at half a second while reviews stream at three — boundary placement IS the streaming design.',
      },
      {
        id: 'm8-loading',
        type: 'server-or-client',
        prompt: 'loading.tsx vs an inline <Suspense> — when do you reach for which?',
        options: [
          'They are interchangeable',
          'loading.tsx = whole-page fallback on navigation; inline Suspense = per-section streaming within an already-visible page',
          'loading.tsx only works for static routes',
        ],
        answerIndex: 1,
        explanation:
          'loading.tsx wraps the entire page segment — instant shell on navigation. Inline boundaries subdivide the page so independent data arrives independently. The PDP uses both: the route flushes via loading.tsx, then sections stream inside it.',
      },
      {
        id: 'm8-notfound',
        type: 'spot-the-bug',
        prompt:
          'Monitoring alerts on 404 rates for retired products, but the dashboard shows zero — while users clearly see the not-found page. Why?',
        options: [
          'The monitoring agent is broken',
          'An ancestor loading.tsx flushed a 200 shell before notFound() ran — the 404 UI streams in, but the HTTP status was already sent',
          'notFound() returns 500 in production',
        ],
        answerIndex: 1,
        explanation:
          'Once streaming starts, the status code is spoken for. notFound() after the shell flush renders the right UI but cannot rewrite the 200. Bots and monitors must key off content (or the fetch must happen before the boundary) — a real SEO/observability gotcha.',
      },
    ],
  },
  {
    slug: 'mutations',
    number: 9,
    title: 'Mutations: Server Actions & Route Handlers',
    summary: 'Add-to-cart both ways; useActionState; progressive enhancement.',
    status: 'available',
    drills: [
      {
        id: 'm9-enhance',
        type: 'predict',
        prompt:
          'A shopper on a slow connection clicks "Add to cart" before hydration finishes. The button is a <form action={serverAction}>. What happens?',
        options: [
          'Nothing — handlers need hydration',
          'The form submits natively and the action runs — progressive enhancement is built in',
          'The click queues and replays after hydration',
        ],
        answerIndex: 1,
        explanation:
          'A Server Action bound to a form action works as a real HTML form submission before any JS runs. useActionState then upgrades the experience (pending state, inline results) once hydrated — the baseline never breaks.',
      },
      {
        id: 'm9-crossing',
        type: 'server-or-client',
        prompt:
          'How does addToCart (a server function) end up callable from the AddToCartButton client component?',
        options: [
          'It is bundled into the client JS',
          "It crosses the boundary as a reference — 'use server' functions are the one callable thing serialization allows",
          'The client calls /api/cart under the hood, which you must define',
        ],
        answerIndex: 1,
        explanation:
          "Server Actions are serializable references to server-side functions. The client invokes the reference; Next routes the call. No handler file, no fetch wrapper — but it IS a network call underneath, so validate inputs like one.",
      },
      {
        id: 'm9-bff',
        type: 'predict',
        prompt:
          'The mobile team wants the same add-to-cart your web form uses. Server Action or route handler?',
        options: [
          'Server Action — they are just HTTP underneath',
          'Route handler — Server Actions are a React-app protocol, not a public API surface',
          'Either works equally well',
        ],
        answerIndex: 1,
        explanation:
          'Server Actions are wired to the React tree (closures, redirects, cache revalidation) and their wire format is framework-internal. The moment a consumer is not this React app — mobile, partners, webhooks — you want a route handler: a stable, documented BFF endpoint over the microservices.',
      },
    ],
  },
  {
    slug: 'seo-metadata',
    number: 10,
    title: 'SEO, metadata & bot rendering',
    summary: 'generateMetadata; streaming and bots; structured data.',
    status: 'planned',
    drills: [],
  },
  {
    slug: 'boundary-journey',
    number: 11,
    title: 'The Boundary Journey (capstone)',
    summary: 'Stages 0→3 with measured metrics; sequencing pushes safely.',
    status: 'planned',
    drills: [],
  },
  {
    slug: 'migration-playbook',
    number: 12,
    title: 'Migration playbook',
    summary: 'Route-by-route ordering, coexistence mechanics, gotchas checklist.',
    status: 'planned',
    drills: [],
  },
]

export function moduleBySlug(slug: string): CurriculumModule | null {
  return MODULES.find((m) => m.slug === slug) ?? null
}
