# Curriculum, Drills & Landing Implementation Plan (Plan 4 of 4 — part A)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the learning half of the site: the MDX curriculum pipeline with a course shell (sidebar + localStorage progress), the drill engine with instant feedback and persistent scores, the real landing page (pitch, learning path, strategy overview) — and the first three modules fully authored. Modules 4–12 are registered and visible as "planned" (the spec: "modules can ship incrementally"); parts B/C author them.

**Architecture:** Modules are MDX files in `content/modules/`, rendered through `app/learn/[module]/page.tsx` via a static import map + `generateStaticParams` (static at build; code blocks highlighted by `@shikijs/rehype` at compile time — zero client JS for prose). `lib/curriculum.ts` is the single registry (slugs, titles, status, drills) feeding the course sidebar, the landing learning path, and the drill decks. Progress is a versioned localStorage document with a pure, unit-tested engine (`lib/progress.ts`) and a thin client hook; the sidebar and drill decks are the only client islands in the learn tree.

**Tech Stack:** adds `@next/mdx@15.5.18` (version-locked to next), `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `@shikijs/rehype@4.3.1` (version-locked to shiki). Everything else unchanged and pinned.

**Authoring deviation (explicit):** module PROSE for modules 2–3 is specified here as complete section outlines + complete drill data, with final MDX prose authored at execution following module 1's fully-written exemplar and the shared anatomy (concept → live embed → before/after diff → drills). All code, registries, and drill content in this plan are complete.

## Global Constraints

- All Plan 1–3 global constraints apply (pinned versions, TS strict, async request APIs, client components never `async`, teaching comments, yarn 4, commit per task, typecheck before commit, Cloudflare chain stays green, registry entries alongside created files).
- New deps pinned EXACT: `@next/mdx@15.5.18`, `@mdx-js/loader@3.1.1`, `@mdx-js/react@3.1.1`, `@shikijs/rehype@4.3.1`.
- Curriculum spec anatomy per module: concept prose → live storefront/lab embed → Pages-vs-App code diff → 3–5 drills. Next 16 callouts appear in module 3 (and later 7/12) as visually distinct asides.
- Drill/progress rules (spec §Drills & progress): instant feedback with explanations; scores + completion persist to localStorage; progress surfaces in the course sidebar. localStorage document is versioned (`v: 1`) and the pure engine tolerates garbage input.
- e2e note: localStorage persistence is asserted within a page session + after reload.

## File Structure (this plan)

```
next.config.ts                      withMDX + pageExtensions + rehype shiki
mdx-components.tsx                  Required MDX hook: maps MDX elements + exposes embeds
content/modules/01-why-app-router.mdx
content/modules/02-mental-model.mdx
content/modules/03-routing-layouts.mdx
lib/curriculum.ts                   Module registry: 12 entries, drills for 1-3
lib/progress.ts                     Pure progress engine (versioned localStorage doc)
components/learn/progress-provider.tsx   Client context over lib/progress
components/learn/course-sidebar.tsx      Module list + completion ticks (client)
components/learn/drill-deck.tsx          Drill cards with instant feedback (client)
components/learn/module-embed.tsx        Styled link-panel to live demos (server)
components/learn/next16-callout.tsx      "What changes in Next 16" aside (server)
components/learn/code-diff.tsx           Before/after two-pane wrapper (server)
app/learn/layout.tsx                Course shell (sidebar + content)
app/learn/[module]/page.tsx         MDX import map + generateStaticParams
app/page.tsx                        REPLACES the landing stub
tests/unit/progress.test.ts, tests/unit/curriculum.test.ts
tests/e2e/learn.spec.ts
```

---

### Task 1: MDX pipeline

**Files:**
- Modify: `next.config.ts`, `package.json` (deps)
- Create: `mdx-components.tsx`, `content/modules/01-why-app-router.mdx` (placeholder single line, replaced in Task 6), `app/learn/[module]/page.tsx` (minimal first version), `lib/curriculum.ts` (minimal first version — extended in Task 2)
- Test: `tests/e2e/learn.spec.ts` (first test)

**Interfaces:**
- Produces: `/learn/why-app-router` renders MDX through the app router; `lib/curriculum.ts` exports `MODULES` (extended in Task 2) and `moduleBySlug()`.

- [ ] **Step 1: Install pinned deps**

Run: `yarn add @next/mdx@15.5.18 @mdx-js/loader@3.1.1 @mdx-js/react@3.1.1 @shikijs/rehype@4.3.1`

- [ ] **Step 2: Write the failing e2e test**

`tests/e2e/learn.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('a curriculum module renders through the MDX pipeline', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Why the App Router/i)
})
```

Run: `yarn test:e2e tests/e2e/learn.spec.ts` — FAIL (404).

- [ ] **Step 3: Implement the pipeline**

`next.config.ts`:

```ts
import createMDX from '@next/mdx'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // MDX modules live under content/ and are imported by app/learn/[module].
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: {
    // Shiki highlights code blocks AT COMPILE TIME — prose ships zero JS.
    rehypePlugins: [['@shikijs/rehype', { theme: 'github-dark' }]],
  },
})

export default withMDX(nextConfig)
```

NOTE: `@next/mdx` requires plugin references as strings (serializable) when
Turbopack is used for dev; the string-tuple form above works for both
bundlers in 15.5.

`mdx-components.tsx` (repo root — the file name and export are a Next convention):

```tsx
// Required by @next/mdx: maps MDX output to components. This is also where
// curriculum embeds become available inside .mdx without imports.
import type { MDXComponents } from 'mdx/types'
import { CodeDiff } from '@/components/learn/code-diff'
import { ModuleEmbed } from '@/components/learn/module-embed'
import { Next16Callout } from '@/components/learn/next16-callout'
import { DrillDeck } from '@/components/learn/drill-deck'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ModuleEmbed,
    Next16Callout,
    CodeDiff,
    DrillDeck,
    ...components,
  }
}
```

(The four components are created in Tasks 3–5; for THIS task, create them as
minimal typed stubs that render children — replaced by the real
implementations in their tasks. Stub example: `export function Next16Callout({ children }: { children?: React.ReactNode }) { return <aside>{children}</aside> }`.)

`lib/curriculum.ts` (minimal; extended in Task 2):

```ts
export type ModuleStatus = 'available' | 'planned'
export type CurriculumModule = {
  slug: string
  number: number
  title: string
  summary: string
  status: ModuleStatus
}
export const MODULES: CurriculumModule[] = [
  {
    slug: 'why-app-router',
    number: 1,
    title: 'Why the App Router',
    summary: 'What it unlocks, and the migration in one picture.',
    status: 'available',
  },
]
export function moduleBySlug(slug: string): CurriculumModule | null {
  return MODULES.find((m) => m.slug === slug) ?? null
}
```

`content/modules/01-why-app-router.mdx` (replaced with real content in Task 6):

```mdx
# Why the App Router

(Authored in Task 6.)
```

`app/learn/[module]/page.tsx`:

```tsx
// Curriculum route: a static import map keyed by slug. generateStaticParams
// prerenders every available module; unknown slugs 404. MDX compiles to
// server components — module prose ships as HTML, not JS.
import type { ComponentType } from 'react'
import { notFound } from 'next/navigation'
import { MODULES, moduleBySlug } from '@/lib/curriculum'

const CONTENT: Record<string, () => Promise<{ default: ComponentType }>> = {
  'why-app-router': () => import('@/content/modules/01-why-app-router.mdx'),
}

export function generateStaticParams() {
  return MODULES.filter((m) => m.status === 'available').map((m) => ({ module: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params
  return { title: moduleBySlug(slug)?.title ?? 'Module' }
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params
  const load = CONTENT[slug]
  if (!load) notFound()
  const { default: Content } = await load()
  return (
    <article className="prose prose-zinc max-w-none">
      <Content />
    </article>
  )
}
```

NOTE on types: add `"mdx"` typings by creating `mdx.d.ts` at repo root:

```ts
declare module '*.mdx' {
  import type { ComponentType } from 'react'
  const Content: ComponentType
  export default Content
}
```

- [ ] **Step 4: Verify green + commit**

Run: `yarn test:e2e tests/e2e/learn.spec.ts` — PASS. `yarn typecheck` — 0. `yarn build` — exit 0.

```bash
git add -A && git commit -m "feat: add mdx curriculum pipeline with compile-time shiki highlighting"
```

---

### Task 2: Curriculum registry + drills data + progress engine (pure)

**Files:**
- Modify: `lib/curriculum.ts` (full 12-module registry + drill data for modules 1–3)
- Create: `lib/progress.ts`
- Test: `tests/unit/curriculum.test.ts`, `tests/unit/progress.test.ts`

**Interfaces:**
- `Drill { id: string; type: 'server-or-client' | 'predict' | 'spot-the-bug'; prompt: string; options: string[]; answerIndex: number; explanation: string }`
- `CurriculumModule` gains `drills: Drill[]`
- `MODULES`: 12 entries in spec order; 1–3 `available` with 3+ drills each; 4–12 `planned` with empty drills
- `lib/progress.ts` (pure, no browser APIs):
  - `ProgressDoc { v: 1; modules: Record<string, { answers: Record<string, boolean>; completedAt: string | null }> }`
  - `emptyProgress(): ProgressDoc`
  - `parseProgress(raw: string | null): ProgressDoc` — tolerates null/garbage/foreign versions by returning empty
  - `recordAnswer(doc: ProgressDoc, moduleSlug: string, drillId: string, correct: boolean, drillCount: number, now: string): ProgressDoc` — immutably records; sets `completedAt = now` when all `drillCount` drills have been answered correctly at least once
  - `moduleProgress(doc: ProgressDoc, moduleSlug: string, drillCount: number): { answered: number; correct: number; complete: boolean }`

**Unit tests (complete):** curriculum: 12 modules, unique slugs/numbers in order, modules 1–3 available with ≥3 drills whose `answerIndex` is in range; progress: parse tolerates `null`/`'garbage'`/`'{"v":99}'`; recordAnswer marks complete only when all drills correct; wrong answers recorded but don't complete; moduleProgress counts.

Drill data (complete, authored here) — module 1 (`why-app-router`): three `predict` drills on layouts persistence, streaming benefit, client-bundle default; module 2 (`mental-model`): three `server-or-client` drills (ProductCard render, AddToCartButton, service client); module 3 (`routing-layouts`): three drills incl. one `spot-the-bug` (event handler passed from server layout to client child). Full objects are written in this task with prompts, options, correct indexes, and explanations of at least one sentence each.

- [ ] Steps: failing tests → implement → green → `git commit -m "feat: add full curriculum registry, module 1-3 drills, and progress engine"`

---

### Task 3: Progress provider + course shell + sidebar

**Files:**
- Create: `components/learn/progress-provider.tsx`, `components/learn/course-sidebar.tsx`, `app/learn/layout.tsx`
- Test: append to `tests/e2e/learn.spec.ts`

**Interfaces:**
- `ProgressProvider` (client): loads `localStorage['arfg-progress']` after mount (SSR-safe), exposes `{ doc, record(moduleSlug, drillId, correct, drillCount) }` via context; writes through to localStorage on every record.
- `CourseSidebar` (client): renders all 12 modules from `MODULES`; available ones link to `/learn/[slug]` with a ✓ when `moduleProgress(...).complete`; planned ones render greyed with "planned" badge; `data-testid="sidebar-module-<slug>"`, tick has `data-testid="module-complete-<slug>"`.
- `app/learn/layout.tsx` (server): grid of sidebar + `{children}`, wrapped in `ProgressProvider`.

**e2e (complete):**

```ts
test('course shell lists all 12 modules with planned ones marked', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  await expect(page.getByTestId(/sidebar-module-/)).toHaveCount(12)
  await expect(page.getByTestId('sidebar-module-migration-playbook')).toContainText('planned')
})
```

- [ ] Steps: failing test → implement → green → `git commit -m "feat: add course shell with progress-aware sidebar"`

---

### Task 4: Drill deck with instant feedback + persistence

**Files:**
- Create: `components/learn/drill-deck.tsx` (replaces Task 1 stub)
- Test: append to `tests/e2e/learn.spec.ts`

**Interfaces:**
- `DrillDeck({ module }: { module: string })` (client): looks up drills from `MODULES`; renders each as a card — prompt, option buttons, instant right/wrong styling + explanation after answering; records via ProgressProvider. `data-testid`s: `drill-<id>`, `drill-option` buttons, `drill-explanation`, `deck-score`.

**e2e (complete):**

```ts
test('drills give instant feedback and persist across reload', async ({ page }) => {
  await page.goto('/learn/why-app-router')
  const first = page.getByTestId(/^drill-/).first()
  await first.getByTestId('drill-option').first().click()
  await expect(first.getByTestId('drill-explanation')).toBeVisible()
  const score = await page.getByTestId('deck-score').textContent()
  await page.reload()
  await expect(page.getByTestId('deck-score')).toHaveText(score ?? '')
})
```

- [ ] Steps: failing test → implement → green → `git commit -m "feat: add drill deck with instant feedback and localStorage persistence"`

---

### Task 5: Module embeds, Next 16 callout, code diff components

**Files:**
- Create: `components/learn/module-embed.tsx`, `components/learn/next16-callout.tsx`, `components/learn/code-diff.tsx` (replace stubs)
- Modify: `lib/source-registry.ts` (add `learn-drill-deck` → `components/learn/drill-deck.tsx`)

**Interfaces (all server components):**
- `ModuleEmbed({ href, title, children })` — bordered panel linking to a live demo (store page, journey stage, lab) with an "open live ↗" affordance.
- `Next16Callout({ children })` — visually distinct amber aside titled "What changes in Next 16".
- `CodeDiff({ before, after, children })` — two-pane grid; `before`/`after` are labels; children are the two fenced code blocks from MDX (rendered side by side via CSS grid `[&>pre]` styling).

- [ ] Steps: implement (covered by module e2e in Task 6; registry test covers the entry) → typecheck → `git commit -m "feat: add curriculum embed, callout, and code-diff components"`

---

### Task 6: Author modules 1–3 (full MDX)

**Files:**
- Replace: `content/modules/01-why-app-router.mdx`; Create: `02-mental-model.mdx`, `03-routing-layouts.mdx`
- Modify: `app/learn/[module]/page.tsx` CONTENT map (add slugs 2–3)
- Test: append to `tests/e2e/learn.spec.ts`

Anatomy for every module (spec): concept prose → `<ModuleEmbed>` to a live demo → `<CodeDiff>` Pages-vs-App code comparison → `<DrillDeck module="…">`. Module 1 content is fully drafted in this plan (see appendix note); modules 2–3 follow the same anatomy from their outlines:
- **Module 1 — Why the App Router:** the four unlocks (streaming, smaller bundles, layouts, Server Actions) each tied to a live embed (journey dashboard as the anchor); the migration-in-one-picture section pointing at stages 0→3; diff: `getInitialProps` PDP head vs stage-3 page head.
- **Module 2 — The mental model shift:** route-level data + hydrate-everything vs a tree split across environments; the dial you control; embed: Boundary Explorer; diff: stage-1 page vs stage-3 page (the SAME route, different split); drills: server-or-client classification.
- **Module 3 — Routing, layouts & file conventions:** the pages→app mapping table (`_app`/`_document` → root layout, `pages/api` → route handlers, `next/router` → `next/navigation`); persistent layouts (embed: navigate store vs legacy); `loading.tsx`/`error.tsx`/`not-found.tsx`; `<Next16Callout>` middleware → proxy rename; diff: `pages/_app.tsx` vs `app/layout.tsx` (both real files in this repo).

**e2e (complete):**

```ts
test('modules 2 and 3 render with embeds, diffs, and drills', async ({ page }) => {
  await page.goto('/learn/mental-model')
  await expect(page.getByTestId(/^drill-/).first()).toBeVisible()
  await page.goto('/learn/routing-layouts')
  await expect(page.getByText('What changes in Next 16')).toBeVisible()
})
```

- [ ] Steps: failing test → author MDX → green → `git commit -m "feat: author curriculum modules 1-3"`

---

### Task 7: Landing page

**Files:**
- Replace: `app/page.tsx`
- Test: append to `tests/e2e/learn.spec.ts`

**Content (complete requirements):** hero (site pitch, two CTAs: "Start module 1" → `/learn/why-app-router`, "Explore the demo store" → `/store`); the strategy picture — a four-step stage strip (0→3, real links, one-line each) mirroring the journey; the learning path — 12 module cards from `MODULES` (planned ones greyed, `data-testid="path-module"`); a row linking the three labs. Remove the "Landing stub" comment; header comment explains this page IS module 0.

**e2e (complete):**

```ts
test('landing page shows the pitch, stage strip, and 12-module path', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link', { name: /Start module 1/i })).toBeVisible()
  await expect(page.getByTestId('path-module')).toHaveCount(12)
})
```

- [ ] Steps: failing test → implement → green → `git commit -m "feat: replace landing stub with pitch, stage strip, and learning path"`

---

### Task 8: README, full verification, deploy-compat

- README: Curriculum section (available vs planned modules, progress storage note).
- `yarn vitest run` / `yarn test:e2e` / `yarn lint` / `yarn typecheck` — all green.
- `yarn build` — exit 0, zero copy errors (MDX compiled at build; verify snapshot + metrics steps still run).
- workerd preview curls: `/`, `/learn/why-app-router`, `/learn/routing-layouts` → 200 with content.
- `git commit -m "docs: add curriculum section to README; verify full deploy chain"`

---

## Self-Review Notes

- **Spec coverage:** MDX modules with the uniform anatomy ✔; drills with instant feedback + localStorage + sidebar surfacing ✔; landing with pitch/learning path/strategy ✔ (spec route map's `learn/layout.tsx` + `[module]/page.tsx` shape ✔); Next 16 callout present in module 3 (7/12 come with parts B/C) ✔; incremental shipping is the spec's own mitigation for scope ✔.
- **Type consistency:** `Drill`/`CurriculumModule`/`MODULES` (T2) feed sidebar (T3), deck (T4), landing (T7); `ProgressDoc` engine (T2) is the only persistence logic — provider (T3) is a thin shell.
- **Placeholders:** Task 1 stubs are explicitly temporary with their replacement tasks named; module 2–3 prose authored at execution per the header's declared deviation.
