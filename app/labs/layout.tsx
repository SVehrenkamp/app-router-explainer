// Labs shell. Each lab is an instrument, not a lesson page — the chrome stays
// minimal so the instrument fills the screen.
import Link from 'next/link'
import { DevModeBanner } from '@/components/dev-mode-banner'

export default function LabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <DevModeBanner />
      <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
        <Link href="/labs" className="font-display text-xl font-bold tracking-tight">
          Labs
        </Link>
        <Link href="/labs/boundary-explorer" className="text-sm text-zinc-600 hover:text-zinc-900">
          Boundary Explorer
        </Link>
        <Link href="/labs/cache-lab" className="text-sm text-zinc-600 hover:text-zinc-900">
          Cache Lab
        </Link>
        <Link href="/labs/rsc-inspector" className="text-sm text-zinc-600 hover:text-zinc-900">
          RSC Inspector
        </Link>
      </header>
      {children}
    </div>
  )
}
