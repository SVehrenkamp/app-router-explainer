// Root layout — the App Router replacement for BOTH _app.tsx and _document.tsx.
// It renders <html>/<body> (formerly _document) and wraps every route (formerly _app).
// Unlike _app, it is a Server Component and does NOT re-render on navigation.
//
// Design system lives here + globals.css: Bricolage Grotesque is the display
// voice, JetBrains Mono the instrument voice (measured numbers, labels), and
// the teal→indigo "seam" is the boundary-as-brand.
import type { Metadata } from 'next'
import { Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { Providers } from '@/app/providers'
import './globals.css'

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage' })
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: { default: 'App Router Field Guide', template: '%s · App Router Field Guide' },
  description:
    'An interactive guide to migrating a large ecommerce app from the Pages Router to the App Router.',
}

const NAV = [
  { href: '/learn/why-app-router', label: 'Curriculum' },
  { href: '/journey', label: 'Boundary Journey' },
  { href: '/labs', label: 'Labs' },
  { href: '/store', label: 'Demo Store' },
]

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <nav className="sticky top-0 z-40 border-b border-zinc-200/80 bg-zinc-50/85 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center gap-7 px-4 py-3">
            <Link href="/" className="group relative font-display text-[15px] font-bold tracking-tight">
              App Router Field Guide
              <span className="seam absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full opacity-80 transition-opacity group-hover:opacity-100" />
            </Link>
            <div className="ml-auto flex items-center gap-5">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <Providers>
          <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
        </Providers>
        <footer className="mt-20 border-t border-zinc-200">
          <div className="seam h-[2px] w-full" />
          <div className="mx-auto flex max-w-6xl flex-wrap items-baseline gap-x-8 gap-y-2 px-4 py-8 text-sm text-zinc-500">
            <span className="font-display font-semibold text-zinc-700">App Router Field Guide</span>
            <span>
              Every page is running code — look for{' '}
              <span className="font-mono text-xs">&lt;/&gt; Show me the code</span>.
            </span>
            <span className="ml-auto font-mono text-xs">
              <span className="text-teal-700">server</span>
              <span className="mx-1 text-zinc-400">/</span>
              <span className="text-indigo-600">client</span>
            </span>
          </div>
        </footer>
      </body>
    </html>
  )
}
