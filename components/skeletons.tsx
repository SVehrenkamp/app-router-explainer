// Suspense fallbacks. Named data-testids let e2e tests assert that streaming
// really is progressive (skeleton visible while slower sections resolve).
export function GridSkeleton() {
  return (
    <div data-testid="grid-skeleton" className="grid grid-cols-2 gap-4 md:grid-cols-3">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="h-44 animate-pulse rounded-xl bg-zinc-200" />
      ))}
    </div>
  )
}

export function PriceSkeleton() {
  return <div data-testid="price-skeleton" className="h-8 w-32 animate-pulse rounded bg-zinc-200" />
}

export function InventorySkeleton() {
  return <div data-testid="inventory-skeleton" className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
}

export function ReviewsSkeleton() {
  return (
    <div data-testid="reviews-skeleton" className="space-y-3">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-lg bg-zinc-200" />
      ))}
    </div>
  )
}
