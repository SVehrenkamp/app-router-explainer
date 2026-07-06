// Allowlist for the source API. Ids — not paths — cross the network, so the
// endpoint cannot be used to read arbitrary files.
export type SourceEntry = { path: string; title: string }

export const SOURCE_FILES = {
  'store-plp': { path: 'app/store/page.tsx', title: 'PLP — React Query hydration' },
  'store-pdp': { path: 'app/store/products/[slug]/page.tsx', title: 'PDP — streaming page' },
  'pdp-sections': {
    path: 'app/store/products/[slug]/sections.tsx',
    title: 'PDP — streaming sections',
  },
  'cart-page': { path: 'app/store/cart/page.tsx', title: 'Cart page (Server Actions from a server component)' },
  'cart-actions': { path: 'app/store/cart/actions.ts', title: 'Cart Server Actions' },
  'add-to-cart': { path: 'components/add-to-cart-button.tsx', title: 'AddToCartButton client island' },
  'product-grid': { path: 'components/product-grid.tsx', title: 'ProductGrid — useSuspenseInfiniteQuery' },
  'services-client': { path: 'lib/services.ts', title: 'Server-only service client' },
} as const satisfies Record<string, SourceEntry>

export type SourceId = keyof typeof SOURCE_FILES
