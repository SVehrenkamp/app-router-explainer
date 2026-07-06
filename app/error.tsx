'use client'

// Route-segment error boundary — replaces pages/_error.tsx, but scoped: only
// this segment's subtree is replaced, and reset() re-renders it. Must be a
// client component (it holds interactive recovery state).
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <section className="space-y-4 py-16 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="text-sm text-zinc-500">Digest: {error.digest ?? 'n/a'}</p>
      <button onClick={reset} className="rounded-lg bg-zinc-900 px-4 py-2 text-white">
        Try again
      </button>
    </section>
  )
}
