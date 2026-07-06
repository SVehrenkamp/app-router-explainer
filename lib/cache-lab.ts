// Cache Lab plumbing. The lab's core trick: every target route returns the
// timestamp of when its body was GENERATED. If two responses carry the same
// generatedAt, a cache served the second one — that equality IS the hit/miss
// signal, independent of any header.
export type ProbeSample = { at: number; generatedAt: string; cacheControl: string | null }
export type TimelinePoint = { at: number; hit: boolean }

export function classifySamples(samples: ProbeSample[]): TimelinePoint[] {
  return samples.map((sample, i) => ({
    at: sample.at,
    hit: i > 0 && sample.generatedAt === samples[i - 1].generatedAt,
  }))
}

export const CACHE_TARGETS: Array<{
  id: 'static' | 'dynamic' | 'revalidate' | 'tagged'
  path: string
  label: string
  description: string
}> = [
  {
    id: 'static',
    path: '/api/labs/cache/static',
    label: 'force-static',
    description:
      'Rendered once, served from the Full Route Cache. Every request after the first is a hit.',
  },
  {
    id: 'dynamic',
    path: '/api/labs/cache/dynamic',
    label: 'force-dynamic',
    description:
      'Rendered per request, Cache-Control: no-store. Every request is a miss — by design.',
  },
  {
    id: 'revalidate',
    path: '/api/labs/cache/revalidate',
    label: 'revalidate: 10',
    description:
      'Cached, re-generated in the background at most every 10 seconds (stale-while-revalidate).',
  },
  {
    id: 'tagged',
    path: '/api/labs/cache/tagged',
    label: "unstable_cache + tag 'lab-tagged'",
    description: 'Cached until the tag is revalidated — the on-demand invalidation story.',
  },
]
