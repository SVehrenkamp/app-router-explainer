'use client'

// The Cache Lab instrument. Hits a chosen target route, samples generatedAt +
// Cache-Control, classifies hits (generatedAt repeated ⇒ served from cache),
// and shows the headers a CDN in front of this app would key on.
import { useState, useTransition } from 'react'
import { revalidateLabPath, revalidateLabTag } from '@/app/labs/cache-lab/actions'
import { CACHE_TARGETS, classifySamples, type ProbeSample } from '@/lib/cache-lab'

export function CacheLab() {
  const [targetId, setTargetId] = useState<(typeof CACHE_TARGETS)[number]['id']>('static')
  const [samples, setSamples] = useState<Record<string, ProbeSample[]>>({})
  const [lastAction, setLastAction] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const target = CACHE_TARGETS.find((t) => t.id === targetId)!
  const targetSamples = samples[targetId] ?? []
  const timeline = classifySamples(targetSamples)

  const fire = async () => {
    // cache: 'no-store' busts the BROWSER cache only; the server-side layers
    // (Full Route Cache, Data Cache) key on the route path and still answer —
    // which is exactly what the lab measures.
    const res = await fetch(target.path, { cache: 'no-store' })
    const body = (await res.json()) as { generatedAt: string }
    const sample: ProbeSample = {
      at: Date.now(),
      generatedAt: body.generatedAt,
      cacheControl: res.headers.get('cache-control'),
    }
    setSamples((prev) => ({ ...prev, [targetId]: [...(prev[targetId] ?? []), sample] }))
  }

  const runAction = (action: () => Promise<{ revalidated: string; at: string }>) =>
    startTransition(async () => {
      const result = await action()
      setLastAction(`revalidated ${result.revalidated} at ${result.at}`)
    })

  return (
    <div data-testid="cache-lab-root" className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CACHE_TARGETS.map((t) => (
          <button
            key={t.id}
            data-testid={`cache-target-${t.id}`}
            onClick={() => setTargetId(t.id)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              t.id === targetId
                ? 'border-zinc-900 bg-zinc-900 text-white shadow-sm'
                : 'border-zinc-300 hover:bg-zinc-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <p className="max-w-2xl text-sm text-zinc-600">{target.description}</p>

      <div className="flex flex-wrap items-center gap-2">
        <button
          data-testid="cache-fire"
          onClick={fire}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-700"
        >
          Fire request
        </button>
        <button
          data-testid="cache-revalidate-tag"
          onClick={() => runAction(revalidateLabTag)}
          disabled={isPending}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50"
        >
          revalidateTag(&apos;lab-tagged&apos;)
        </button>
        <button
          onClick={() => runAction(revalidateLabPath)}
          disabled={isPending}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-100 disabled:opacity-50"
        >
          revalidatePath(revalidate target)
        </button>
        {lastAction && <span className="text-sm text-emerald-700">{lastAction}</span>}
      </div>

      <div data-testid="cache-timeline" className="flex items-center gap-1">
        {timeline.map((point, i) => (
          <span
            key={i}
            title={point.hit ? 'HIT — same generatedAt as previous' : 'MISS — freshly generated'}
            className={`h-6 w-6 rounded-md shadow-xs ${point.hit ? 'bg-teal-500' : 'bg-amber-400'}`}
          />
        ))}
        {timeline.length === 0 && (
          <span className="text-sm text-zinc-500">Fire a few requests to build the timeline.</span>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          {targetSamples.map((sample, i) => (
            <div
              key={sample.at}
              data-testid="cache-sample"
              className="font-mono text-xs text-zinc-700"
            >
              #{i + 1} generatedAt={sample.generatedAt}{' '}
              <span className={timeline[i]?.hit ? 'text-emerald-700' : 'text-amber-700'}>
                {timeline[i]?.hit ? 'HIT' : 'MISS'}
              </span>
            </div>
          ))}
        </div>
        <div data-testid="cdn-lens" className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
          <div className="mb-1 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
            CDN lens — what Fastly would see
          </div>
          <code className="break-all font-mono text-sm">
            cache-control: {targetSamples.at(-1)?.cacheControl ?? '(fire a request)'}
          </code>
          <p className="mt-2 text-xs text-zinc-500">
            Tags are a Next-internal index — revalidateTag marks the Data Cache stale but is NOT a
            CDN surrogate-key purge. Your CDN&apos;s copy obeys only these headers.
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Semantics honesty: under <code>next dev</code> several caches are disabled — run{' '}
        <code>next build &amp;&amp; next start</code> for the real behavior. On the Cloudflare
        deployment, cross-request caches are per-isolate best-effort (no shared incremental cache
        is configured).
      </p>
    </div>
  )
}
