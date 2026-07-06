'use server'

// Server Actions — the App Router replacement for POSTing to pages/api/cart.
// They run only on the server, can write cookies (RSC render cannot), and are
// the ONLY kind of function that may cross the server→client boundary as a prop.
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import {
  CART_COOKIE,
  addItem,
  cartCount,
  parseCart,
  serializeCart,
  setItemQty,
} from '@/lib/cart'

export type CartActionState = { ok: boolean; count: number; error: string | null }

export async function addToCart(
  prevState: CartActionState,
  formData: FormData
): Promise<CartActionState> {
  const slug = formData.get('slug')
  if (typeof slug !== 'string' || slug === '') {
    return { ok: false, count: prevState.count, error: 'Missing product' }
  }
  const cookieStore = await cookies()
  const items = addItem(parseCart(cookieStore.get(CART_COOKIE)?.value), slug)
  cookieStore.set(CART_COOKIE, serializeCart(items), { path: '/' })
  revalidatePath('/store/cart')
  return { ok: true, count: cartCount(items), error: null }
}

export async function updateQuantity(formData: FormData): Promise<void> {
  const slug = formData.get('slug')
  const qty = Number(formData.get('qty'))
  if (typeof slug !== 'string' || !Number.isFinite(qty)) return
  const cookieStore = await cookies()
  const items = setItemQty(parseCart(cookieStore.get(CART_COOKIE)?.value), slug, qty)
  cookieStore.set(CART_COOKIE, serializeCart(items), { path: '/' })
  revalidatePath('/store/cart')
}
