// Nested layout — persists across /store/* navigations WITHOUT re-rendering.
// Also hosts X-ray mode: the provider lives in the layout so its state survives
// navigation (layout persistence is exactly why _app-style state maps to layouts).
import Link from 'next/link'
import { XrayPanel } from '@/components/xray/panel'
import { XrayProvider } from '@/components/xray/provider'
import { XrayToggle } from '@/components/xray/toggle'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <XrayProvider>
      <div>
        <header className="mb-6 flex items-center gap-6 border-b border-zinc-200 pb-4">
          <Link href="/store" className="text-xl font-semibold">
            Fieldgoods
          </Link>
          <Link href="/store/search" className="text-sm text-zinc-600 hover:text-zinc-900">
            Search
          </Link>
          <Link href="/store/cart" className="text-sm text-zinc-600 hover:text-zinc-900">
            Cart
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
