// Client-bundle measurement for the Boundary Journey dashboard. The numbers
// come from the .next build manifests (scripts/journey-metrics.mjs) — the same
// data behind `next build`'s "First Load JS" column — so the dashboard shows
// MEASURED payoff per boundary push, not marketing. Sizes are uncompressed
// bytes on disk; the dashboard labels them as such.
export type StageMeasurement = {
  stage: number
  route: string
  firstLoadKB: number | null
  pageKB: number | null
}
export type MetricsFile = { note: string; measurements: StageMeasurement[] }

export const MANIFEST_ROUTES: Array<{
  stage: number
  router: 'pages' | 'app'
  manifestKey: string
}> = [
  { stage: 0, router: 'pages', manifestKey: '/legacy/products/[slug]' },
  { stage: 1, router: 'app', manifestKey: '/journey/stage-1/products/[slug]/page' },
  { stage: 2, router: 'app', manifestKey: '/journey/stage-2/products/[slug]/page' },
  { stage: 3, router: 'app', manifestKey: '/journey/stage-3/products/[slug]/page' },
]

export function sumRouteKB(files: string[], sizeOf: (file: string) => number): number {
  const js = [...new Set(files)].filter((f) => f.endsWith('.js'))
  const bytes = js.reduce((sum, f) => sum + sizeOf(f), 0)
  return Math.round((bytes / 1024) * 10) / 10
}

// Page-specific JS: files THIS route ships that none of its sibling routes
// do. Shared framework/layout chunks cancel out, so this is the number that
// actually moves when the client boundary moves — totals are dominated by the
// router's shared baseline (a real migration gotcha the dashboard teaches).
export function uniqueRouteKB(
  files: string[],
  siblingRoutesFiles: string[][],
  sizeOf: (file: string) => number
): number {
  const shared = new Set(siblingRoutesFiles.flat())
  return sumRouteKB(files.filter((f) => !shared.has(f)), sizeOf)
}
