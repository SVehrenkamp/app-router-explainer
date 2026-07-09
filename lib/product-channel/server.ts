import 'server-only'

// STEP 3: the server half — "context" for server components. There is no
// useContext on the server, but React's cache() gives the equivalent scope:
// one memoized slot per request render. The channel seeds it; any server
// component below can read it with no prop threading. Same selectors, new
// front door. (The poison-pill import above guarantees this file can never
// leak into a client bundle.)
import { cache } from 'react'
import {
  selectDiscountPercent,
  selectDisplayPrice,
  selectName,
  type ProductBundle,
} from '@/lib/product-channel/selectors'

// cache() memoizes per request, so this slot is request-isolated the way a
// Provider's value is tree-isolated. Concurrent requests never share it.
const requestSlot = cache(() => ({ current: null as ProductBundle | null }))

export function provideProductBundle(bundle: ProductBundle) {
  requestSlot().current = bundle
}

function readBundle(): ProductBundle {
  const bundle = requestSlot().current
  if (!bundle) {
    // Mirrors the client hook's missing-Provider error — same contract,
    // same failure mode, per environment.
    throw new Error('productName()/productDisplayPrice() called outside <ProductChannel>')
  }
  return bundle
}

// The server accessor API — one-line mirrors of the client hooks. Migrating a
// consumer from client to server is: drop the `use`, drop the 'use client'.
export const productName = () => selectName(readBundle())
export const productDisplayPrice = () => selectDisplayPrice(readBundle())
export const productDiscountPercent = () => selectDiscountPercent(readBundle())
