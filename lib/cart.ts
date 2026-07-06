// Pure cart logic over a cookie-serialized value. Kept free of next/headers so
// it is unit-testable and importable from both actions and pages.
export type CartItem = { slug: string; qty: number }

export const CART_COOKIE = 'demo-cart'
const MAX_QTY = 99

function clampQty(qty: number): number {
  return Math.min(Math.max(Math.trunc(qty), 0), MAX_QTY)
}

export function parseCart(raw: string | undefined): CartItem[] {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const items: CartItem[] = []
    for (const entry of parsed) {
      if (
        typeof entry === 'object' &&
        entry !== null &&
        typeof (entry as CartItem).slug === 'string' &&
        typeof (entry as CartItem).qty === 'number'
      ) {
        const qty = clampQty((entry as CartItem).qty)
        if (qty > 0 && !items.some((i) => i.slug === (entry as CartItem).slug)) {
          items.push({ slug: (entry as CartItem).slug, qty })
        }
      }
    }
    return items
  } catch {
    return []
  }
}

export function serializeCart(items: CartItem[]): string {
  return JSON.stringify(items)
}

export function addItem(items: CartItem[], slug: string, qty = 1): CartItem[] {
  const existing = items.find((i) => i.slug === slug)
  if (!existing) return [...items, { slug, qty: clampQty(qty) || 1 }]
  return items.map((i) =>
    i.slug === slug ? { ...i, qty: clampQty(i.qty + qty) || 1 } : i
  )
}

export function setItemQty(items: CartItem[], slug: string, qty: number): CartItem[] {
  const clamped = clampQty(qty)
  if (clamped === 0) return items.filter((i) => i.slug !== slug)
  return items.map((i) => (i.slug === slug ? { ...i, qty: clamped } : i))
}

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.qty, 0)
}
