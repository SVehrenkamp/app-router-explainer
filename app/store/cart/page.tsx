// The cart page reads cookies() — that makes it dynamic, rendered per-request.
// Line-item data fans out with Promise.all (parallel, not a waterfall), and the
// quantity/remove forms post to Server Actions from a SERVER component: no
// client JS needed for any of this page.
import Link from 'next/link'
import { cookies } from 'next/headers'
import { formatPrice } from '@/lib/format'
import { CodeButton } from '@/components/code-button'
import { CART_COOKIE, parseCart } from '@/lib/cart'
import { getPricing, getProductDetail } from '@/lib/services'
import { updateQuantity } from './actions'

export const metadata = { title: 'Cart' }

export default async function CartPage() {
  const cookieStore = await cookies()
  const items = parseCart(cookieStore.get(CART_COOKIE)?.value)

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <p className="text-zinc-600">Your cart is empty.</p>
        <Link href="/store" className="text-zinc-900 underline">
          Browse products →
        </Link>
      </section>
    )
  }

  const lines = (
    await Promise.all(
      items.map(async (item) => {
        const [detail, pricing] = await Promise.all([
          getProductDetail(item.slug),
          getPricing(item.slug, { delayMs: 0 }),
        ])
        return detail ? { item, product: detail.data, pricing: pricing.data } : null
      })
    )
  ).filter((line) => line !== null)

  const subtotalCents = lines.reduce(
    (sum, line) => sum + line.pricing.priceCents * line.item.qty,
    0
  )

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Cart</h1>
        <CodeButton id="cart-page" />
      </div>
      <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 bg-white">
        {lines.map((line) => (
          <li key={line.item.slug} data-testid="cart-line" className="flex items-center gap-4 p-4">
            <span className="text-3xl">{line.product.emoji}</span>
            <div className="flex-1">
              <div className="font-medium">{line.product.name}</div>
              <div className="text-sm text-zinc-600">{formatPrice(line.pricing.priceCents)} each</div>
            </div>
            <form action={updateQuantity} className="flex items-center gap-2">
              <input type="hidden" name="slug" value={line.item.slug} />
              <input
                type="number"
                name="qty"
                min={0}
                max={99}
                defaultValue={line.item.qty}
                className="w-16 rounded border border-zinc-300 px-2 py-1"
              />
              <button type="submit" className="rounded border border-zinc-300 px-3 py-1 text-sm">
                Update
              </button>
            </form>
            <form action={updateQuantity}>
              <input type="hidden" name="slug" value={line.item.slug} />
              <input type="hidden" name="qty" value="0" />
              <button type="submit" className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </form>
          </li>
        ))}
      </ul>
      <div className="text-right text-lg font-semibold" data-testid="cart-subtotal">
        Subtotal: {formatPrice(subtotalCents)}
      </div>
    </section>
  )
}
