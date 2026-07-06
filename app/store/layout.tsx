// Nested layout — persists across /store/* navigations WITHOUT re-rendering.
// In the Pages Router, _app re-ran on every navigation; here the layout's state
// and DOM survive while only the page below it swaps.
import Link from 'next/link'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
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
      </header>
      {children}
    </div>
  )
}
