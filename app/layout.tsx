// Root layout — the App Router replacement for BOTH _app.tsx and _document.tsx.
// It renders <html>/<body> (formerly _document) and wraps every route (formerly _app).
// Unlike _app, it is a Server Component and does NOT re-render on navigation.
import type { Metadata } from 'next'
import Link from 'next/link'
import { Providers } from '@/app/providers'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'App Router Field Guide', template: '%s · App Router Field Guide' },
  description:
    'An interactive guide to migrating a large ecommerce app from the Pages Router to the App Router.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <nav className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
            <Link href="/" className="font-semibold">
              App Router Field Guide
            </Link>
            <Link href="/store" className="text-sm text-zinc-600 hover:text-zinc-900">
              Demo Store
            </Link>
            <Link href="/journey" className="text-sm text-zinc-600 hover:text-zinc-900">
              Boundary Journey
            </Link>
          </div>
        </nav>
        <Providers>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
