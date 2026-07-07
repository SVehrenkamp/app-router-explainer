// Journey shell. Same X-ray chrome as the store: the provider lives in the
// layout so toggling X-ray survives navigation between stages — which is the
// whole point when comparing them.
import Link from 'next/link'
import { DevModeBanner } from '@/components/dev-mode-banner'
import { XrayPanel } from '@/components/xray/panel'
import { XrayProvider } from '@/components/xray/provider'
import { XrayToggle } from '@/components/xray/toggle'

export default function JourneyLayout({ children }: { children: React.ReactNode }) {
  return (
    <XrayProvider>
      <div>
        <DevModeBanner />
        <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
          <Link href="/journey" className="text-xl font-semibold">
            Boundary Journey
          </Link>
          <Link href="/store" className="text-sm text-zinc-600 hover:text-zinc-900">
            Demo Store
          </Link>
          <span className="ml-auto">
            <XrayToggle />
          </span>
        </header>
        {children}
        <XrayPanel />
      </div>
    </XrayProvider>
  )
}
