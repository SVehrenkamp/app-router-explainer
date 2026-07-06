// Reads the .next build manifests and records each journey stage's client-JS
// footprint into lib/journey-metrics.generated.json (committed, like the
// source snapshot — the dashboard imports it at build time). Run after
// `next build` via `yarn metrics`; wired into `yarn build`.
import { readFileSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const dest = path.join(root, 'lib/journey-metrics.generated.json')

// Inline copy of MANIFEST_ROUTES/sumRouteKB semantics: this script must stay
// dependency-free plain JS (it runs mid-build), and the unit-tested TS module
// is the source of truth the test suite checks it against.
const ROUTES = [
  { stage: 0, router: 'pages', manifestKey: '/legacy/products/[slug]' },
  { stage: 1, router: 'app', manifestKey: '/journey/stage-1/products/[slug]/page' },
  { stage: 2, router: 'app', manifestKey: '/journey/stage-2/products/[slug]/page' },
  { stage: 3, router: 'app', manifestKey: '/journey/stage-3/products/[slug]/page' },
]

function sumRouteKB(files, sizeOf) {
  const js = [...new Set(files)].filter((f) => f.endsWith('.js'))
  const bytes = js.reduce((sum, f) => sum + sizeOf(f), 0)
  return Math.round((bytes / 1024) * 10) / 10
}

function uniqueRouteKB(files, siblingRoutesFiles, sizeOf) {
  const shared = new Set(siblingRoutesFiles.flat())
  return sumRouteKB(files.filter((f) => !shared.has(f)), sizeOf)
}

function loadJson(p) {
  return JSON.parse(readFileSync(path.join(root, p), 'utf8'))
}

let buildManifest, appManifest
try {
  buildManifest = loadJson('.next/build-manifest.json')
  appManifest = loadJson('.next/app-build-manifest.json')
} catch {
  console.error('journey-metrics: .next manifests missing — run next build first')
  process.exit(1)
}

const sizeOf = (file) => {
  try {
    return statSync(path.join(root, '.next', file)).size
  } catch {
    return 0
  }
}

const filesFor = ({ router, manifestKey }) =>
  (router === 'pages' ? buildManifest.pages[manifestKey] : appManifest.pages[manifestKey]) ?? null

// Siblings for the page-specific number: same-router measured routes, plus
// '/legacy/search' as the pages-router baseline partner for stage 0.
const pagesBaseline = buildManifest.pages['/legacy/search'] ?? []

const measurements = ROUTES.map((route) => {
  const files = filesFor(route)
  const siblings =
    route.router === 'pages'
      ? [pagesBaseline]
      : ROUTES.filter((r) => r.router === 'app' && r !== route).map((r) => filesFor(r) ?? [])
  return {
    stage: route.stage,
    route: route.manifestKey,
    firstLoadKB: files ? sumRouteKB(files, sizeOf) : null,
    pageKB: files ? uniqueRouteKB(files, siblings, sizeOf) : null,
  }
})

const out = {
  note: 'Uncompressed client JS per route, summed from .next build manifests. Regenerate with `yarn metrics` after a build.',
  measurements,
}
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
console.log(
  `journey-metrics: ${measurements.map((m) => `stage ${m.stage}=${m.firstLoadKB}KB total/${m.pageKB}KB page`).join(', ')}`
)
