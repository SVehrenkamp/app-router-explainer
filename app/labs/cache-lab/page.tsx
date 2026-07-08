// Cache Lab — spec lab §2: the four caching configurations, observed live,
// with the CDN's-eye view. The interactive half of curriculum module 7.
import { CodeButton } from '@/components/code-button'
import { CacheLab } from '@/components/labs/cache-lab'

export const metadata = { title: 'Cache Lab' }

export default function CacheLabPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">Cache Lab</h1>
          <p className="text-zinc-600">
            Pick a route configuration, fire requests, and watch the hit/miss timeline. Same
            generatedAt twice in a row means a cache answered — no marketing, just timestamps.
          </p>
        </div>
        <CodeButton id="lab-cache-lab" />
      </div>
      <CacheLab />
    </section>
  )
}
