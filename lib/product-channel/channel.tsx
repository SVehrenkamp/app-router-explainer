// STEP 4: the bridge — one server component replaces the old provider at each
// migrated route. It fetches ONCE, seeds the server slot for server
// consumers, and hands the same bundle to the unchanged client provider (one
// serialization across the boundary) for every existing hook consumer.
//
// This is the incremental path: routes adopt <ProductChannel> one at a time;
// inside each, components migrate client→server one at a time by swapping
// useProductX() for productX(). Nothing anywhere needs a big bang.
import { notFound } from 'next/navigation'
import { ProductBundleProvider } from '@/lib/product-channel/client'
import { provideProductBundle } from '@/lib/product-channel/server'
import type { ProductBundle } from '@/lib/product-channel/selectors'
import { getPricing, getProductDetail } from '@/lib/services'

export async function ProductChannel({
  slug,
  children,
}: {
  slug: string
  children: React.ReactNode
}) {
  const [product, pricing] = await Promise.all([getProductDetail(slug), getPricing(slug)])
  if (!product) notFound()
  const bundle: ProductBundle = { product: product.data, pricing: pricing.data }

  provideProductBundle(bundle)
  return <ProductBundleProvider bundle={bundle}>{children}</ProductBundleProvider>
}
