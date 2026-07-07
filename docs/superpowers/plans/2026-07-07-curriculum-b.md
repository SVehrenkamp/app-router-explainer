# Curriculum Part B — Modules 4-8 (Plan 4 of 4, part B)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Infrastructure, anatomy, and conventions are defined by Plan 4A (2026-07-06-curriculum.md) and are NOT restated here — this plan is content authorship on that finished pipeline.

**Goal:** Author curriculum modules 4-8 (Server Components & the client boundary; Hooks & client patterns; Data fetching; Caching & your CDN; Streaming, Suspense & loading UI), each with the 4A anatomy: concept prose → live embed → Pages-vs-App CodeDiff → 3 drills. Modules 9-12 remain planned (part C).

**Per-module task recipe (applies to Tasks 1-5):**
1. RED: update tests (unit: module becomes `available` with ≥3 valid drills; e2e sweep asserts the module renders with drills + a module-specific marker).
2. `lib/curriculum.ts`: flip status, add 3 complete drills (prompt/options/answerIndex/explanation).
3. `content/modules/0N-<slug>.mdx`: author full prose per the outline below; wire into the CONTENT map in `app/learn/[module]/page.tsx`.
4. GREEN: learn e2e + unit + typecheck; commit `feat: author curriculum module N — <title>`.

**Module outlines (embeds + diffs fixed here; drills authored in Task steps):**
- **4 — server-components-boundary:** 'use client' marks an entry point; the composition workhorse (server children through client parents — children/props slots); serialization rules recap with the real AddToCartButton/Providers examples. Embed: Boundary Explorer preset stage-2 (the flagged mistake). Diff: importing a server component INTO a client file (breaks) vs passing it as children (works).
- **5 — hooks-client-patterns:** next/router → next/navigation API map; useSearchParams CSR bailout + Suspense requirement; providers under a high boundary (app/providers.tsx); third-party client libs behind wrappers. Embed: /store/search (SearchBox). Diff: pages router.query/router.push vs useSearchParams/useRouter from next/navigation.
- **6 — data-fetching:** getInitialProps → async server components; request memoization (generateMetadata + page dedupe in the real PDP); waterfalls vs Promise.all vs preload; RQ coexistence by journey stage (stay-client list: mutations, infinite scroll, polling). Embed: /journey (stage cards) + stage-2. Diff: legacy getInitialProps Promise.all vs stage-2 server prefetch → HydrationBoundary.
- **7 — caching-cdn:** the four 15.5 caches table; defaults; revalidateTag/Path; Fastly interplay — emitted Cache-Control/CDN-Cache-Control, tags ≠ surrogate keys, streaming vs CDN cacheability; dev-vs-prod divergence. Next16Callout: Cache Components / 'use cache' / cacheLife / cacheTag. Embed: Cache Lab. Diff: pages gSSP res.setHeader('Cache-Control',…) vs route segment config + fetch revalidate/tags.
- **8 — streaming-suspense:** loading.tsx vs inline Suspense; boundary placement (per-section on the PDP) and sequencing; error boundaries around streamed sections; the notFound()-after-flush status-code nuance. Next16Callout: PPR. Embed: stage-3 PDP with ?delay_reviews=3000. Diff: route-level loading.tsx vs inline per-section Suspense (both from this repo).

**Task 6 — Verification:** full unit + e2e + lint + typecheck + `yarn build` + workerd preview curls of modules 4-8; README curriculum section updated (1-8 authored); commit.
