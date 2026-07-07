// Chrome for the pages/legacy/* routes. Unlike an App Router layout, this
// re-mounts on EVERY navigation — there is no layout persistence in the Pages
// Router. That flash of re-rendered chrome is a feature here: feel the difference.
import Head from 'next/head'
import Link from 'next/link'

export function LegacyShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div data-testid="legacy-shell" className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
      <Head>
        <title>{`${title} · Legacy (Pages Router)`}</title>
      </Head>
      <nav className="border-b border-amber-300 bg-amber-50">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 text-sm">
          <span className="rounded bg-amber-200 px-2 py-0.5 font-mono text-xs">pages/ router</span>
          <span className="text-amber-900">Journey stage 0 — the app as it works today</span>
          <Link href="/journey" className="ml-auto text-amber-900 underline">
            ← Boundary Journey
          </Link>
        </div>
      </nav>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}
