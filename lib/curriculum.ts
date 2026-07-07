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
    status: 'planned',
    drills: [],
  },
  {
    slug: 'data-fetching',
    number: 6,
    title: 'Data fetching',
    summary: 'getInitialProps → async server components; React Query coexistence per stage.',
    status: 'planned',
    drills: [],
  },
  {
    slug: 'caching-cdn',
    number: 7,
    title: 'Caching & your CDN',
    summary: 'The four caches, revalidation, and the Fastly interplay.',
    status: 'planned',
    drills: [],
  },
  {
    slug: 'streaming-suspense',
    number: 8,
    title: 'Streaming, Suspense & loading UI',
    summary: 'Boundary placement, sequencing, and the PDP showcase.',
    status: 'planned',
    drills: [],
  },
  {
    slug: 'mutations',
    number: 9,
    title: 'Mutations: Server Actions & Route Handlers',
    summary: 'Add-to-cart both ways; useActionState; progressive enhancement.',
    status: 'planned',
    drills: [],
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
