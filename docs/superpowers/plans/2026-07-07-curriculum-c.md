# Curriculum Part C — Modules 9-12 (Plan 4 of 4, part C — FINAL)

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Same recipe as Plan 4B (2026-07-07-curriculum-b.md); this part completes the curriculum.

**Goal:** Author the final four modules — Mutations; SEO/metadata & bots; The Boundary Journey capstone; Migration playbook — flipping every module to `available`. After this, the spec's route map, features, curriculum, and labs are all shipped.

**Test changes (RED first):** unit registry test → all 12 modules available with ≥3 valid drills (the 9-12-planned test is removed); the course-shell e2e's "planned" assertion is replaced with "all 12 modules are links" (the planned rendering path in the sidebar/landing stays — the registry type keeps supporting future planned entries).

**Module outlines:**
- **9 — mutations:** Server Actions vs route handlers decision; useActionState (the real AddToCartButton) + useOptimistic; progressive enhancement (form works pre-hydration); when BFF route handlers remain right in a microservice stack. Embed: /store/cart. Diff: pages /api/cart + client fetch vs actions.ts + useActionState.
- **10 — seo-metadata:** generateMetadata (real PDP: memoized fetch dedupe); title templates; streaming × bots (the 200-after-flush recap from the SEO angle); the inversion of SSR-for-bots-only; structured data placement. Embed: stage-3 PDP. Diff: next/head in a pages component vs generateMetadata export.
- **11 — boundary-journey (capstone):** the four stages re-read as a decision framework: what to push when (heuristics: leaves with hooks first, shells second, data last); reading the measured table honestly (framework baselines, stage-2's hydration-machinery bump, page-specific collapse); sequencing safely at scale (route-by-route, never mid-sprint on shared components). Embed: /journey. Diff: stage-1 → stage-2 page head (the actual first push).
- **12 — migration-playbook:** route ordering (leaf routes → shells → high-traffic last); coexistence mechanics (this repo IS the proof); sharing code across routers (what legacy-fetch exists for); gotchas checklist (_app logic → providers + layout, router.events → usePathname effects, error pages, dynamic imports, middleware→proxy); perf-regression watch list (bundle per route, hydration time, CLS from skeletons). Embed: /legacy/products + journey dashboard. Diff: the _app "junk drawer" vs its three App Router destinations.

**Final task:** unit + e2e + lint + typecheck + build + workerd preview of 9-12; README says all 12 authored; commit; push; PR (stacked on #4).
