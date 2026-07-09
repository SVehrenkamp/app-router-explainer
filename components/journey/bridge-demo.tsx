'use client'

// The CLIENT consumers in the bridge demo — these components are written
// exactly like the ones in your existing codebase: they call the selector
// hooks and know nothing about where the data came from. Under the channel,
// "where it came from" is a server fetch serialized once across the boundary
// — watch the network tab: no client request for product or pricing.
import { useState } from 'react'
import { XrayRegion } from '@/components/xray/region'
import {
  useProductDiscountPercent,
  useProductDisplayPrice,
  useProductName,
} from '@/lib/product-channel/client'

export function ClientPricePanel() {
  const name = useProductName()
  const price = useProductDisplayPrice()
  const discount = useProductDiscountPercent()
  const [confirmed, setConfirmed] = useState(false)

  return (
    <XrayRegion label="ClientPricePanel · useProductDisplayPrice()" kind="client">
      <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          Client component · existing context hooks, unchanged
        </div>
        <div className="text-sm text-zinc-600">{name}</div>
        <div data-testid="bridge-client-price" className="text-2xl font-semibold">
          {price}
        </div>
        {discount !== null && (
          <div data-testid="bridge-client-discount" className="text-sm text-teal-700">
            {discount}% off list
          </div>
        )}
        <button
          data-testid="bridge-client-interactive"
          onClick={() => setConfirmed(true)}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100"
        >
          {confirmed ? 'Yes — hooks, state, the lot' : 'Prove I can hold state'}
        </button>
      </div>
    </XrayRegion>
  )
}
