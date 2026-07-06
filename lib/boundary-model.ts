// Static model of the stage-3 PDP tree for the Boundary Explorer. Natures and
// props mirror the real components; kb figures approximate each component's
// shipped client JS, anchored to the measured journey bundles (page-specific
// JS runs ~4-20KB per stage — see lib/journey-metrics.generated.json).
import type { BoundaryNode } from '@/lib/boundary-sim'

export const PDP_TREE: BoundaryNode = {
  id: 'page',
  name: 'ProductPage (route)',
  nature: 'async-server',
  kb: 3.2,
  children: [
    {
      id: 'stage-banner',
      name: 'StageBanner',
      nature: 'neutral',
      kb: 0.8,
      children: [{ id: 'code-button', name: 'CodeButton', nature: 'hooks', kb: 2.1 }],
    },
    {
      id: 'product-info',
      name: 'Product info (emoji, name, description)',
      nature: 'neutral',
      kb: 0.9,
    },
    {
      id: 'pricing',
      name: 'PricingPanel',
      nature: 'async-server',
      kb: 1.4,
      children: [{ id: 'xray-report', name: 'XrayReport', nature: 'hooks', kb: 0.4 }],
    },
    { id: 'inventory', name: 'InventoryBadge', nature: 'async-server', kb: 1.1 },
    { id: 'reviews', name: 'ReviewsSection', nature: 'async-server', kb: 2.6 },
    {
      id: 'add-to-cart',
      name: 'AddToCartButton',
      nature: 'hooks',
      kb: 1.8,
      props: [{ name: 'slug', serializable: true }],
    },
  ],
}

// Client-root sets matching the journey stages. Stage 1: boundary at the top.
// Stage 2 deliberately reproduces a common mistake — marking async server
// components as client islands — so the lab flags it. Stage 3: only the
// leaves that truly need the client.
export const STAGE_PRESETS: Record<'stage-1' | 'stage-2' | 'stage-3', string[]> = {
  'stage-1': ['page'],
  'stage-2': ['pricing', 'inventory', 'add-to-cart', 'code-button', 'xray-report'],
  'stage-3': ['add-to-cart', 'code-button', 'xray-report'],
}
