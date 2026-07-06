'use client'

// A deliberately SMALL client island on an otherwise-server PDP.
// useActionState wires a Server Action into client state (pending / result).
import { useActionState } from 'react'
import { addToCart, type CartActionState } from '@/app/store/cart/actions'

const initialState: CartActionState = { ok: false, count: 0, error: null }

export function AddToCartButton({ slug }: { slug: string }) {
  const [state, formAction, isPending] = useActionState(addToCart, initialState)
  return (
    <form action={formAction}>
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isPending}
        data-testid="add-to-cart"
        className="rounded-lg bg-zinc-900 px-5 py-2.5 text-white hover:bg-zinc-700 disabled:opacity-50"
      >
        {isPending ? 'Adding…' : state.ok ? `Added ✓ (${state.count} in cart)` : 'Add to cart'}
      </button>
      {state.error && <p className="mt-1 text-sm text-red-600">{state.error}</p>}
    </form>
  )
}
