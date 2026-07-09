// The context bridge, live. One <ProductChannel> fetches the bundle once and
// serves BOTH worlds: the server panel reads it through productX() accessors
// (zero client JS), the client panel through the original useProductX() hooks
// (zero client fetches). Same selector module computes every value — toggle
// X-ray and compare the two regions' numbers.
import { CodeButton } from '@/components/code-button'
import { ClientPricePanel } from '@/components/journey/bridge-demo'
import { XrayRegion } from '@/components/xray/region'
import { ProductChannel } from '@/lib/product-channel/channel'
import {
  productDiscountPercent,
  productDisplayPrice,
  productName,
} from '@/lib/product-channel/server'

export const metadata = { title: 'Pattern · Context bridge' }

// A SERVER consumer: reads the channel with no props and no hooks. Migrating
// a client consumer to this shape is a one-line change per call site.
function ServerPricePanel() {
  return (
    <XrayRegion label="ServerPricePanel · productDisplayPrice()" kind="server">
      <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
        <div className="font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          Server component · productX() accessors, zero client JS
        </div>
        <div className="text-sm text-zinc-600">{productName()}</div>
        <div data-testid="bridge-server-price" className="text-2xl font-semibold">
          {productDisplayPrice()}
        </div>
        {productDiscountPercent() !== null && (
          <div data-testid="bridge-server-discount" className="text-sm text-teal-700">
            {productDiscountPercent()}% off list
          </div>
        )}
      </div>
    </XrayRegion>
  )
}

export default async function ContextBridgePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-2xl space-y-2">
          <h1 className="font-display text-4xl font-bold tracking-tight">
            The context bridge
          </h1>
          <p className="text-zinc-600">
            A selector-based ProductContext, refactored to serve both worlds without touching
            its client consumers. One fetch in the channel; the server panel reads a
            request-scoped slot, the client panel reads the original context — and the same
            pure selectors compute every value. Toggle X-ray: the numbers match because the
            data and the derivation are shared, only the delivery differs.
          </p>
        </div>
        <CodeButton id="context-bridge" />
      </div>

      <ProductChannel slug={slug}>
        <div className="grid gap-6 md:grid-cols-2">
          <ServerPricePanel />
          <ClientPricePanel />
        </div>
      </ProductChannel>

      <p className="max-w-2xl text-sm text-zinc-500">
        Migration path: adopt <code className="rounded bg-zinc-100 px-1">ProductChannel</code>{' '}
        route by route (it renders the legacy provider, so nothing breaks), then move
        consumers server-side one at a time — each is a one-line swap from{' '}
        <code className="rounded bg-zinc-100 px-1">useProductDisplayPrice()</code> to{' '}
        <code className="rounded bg-zinc-100 px-1">productDisplayPrice()</code>.
      </p>
    </div>
  )
}
