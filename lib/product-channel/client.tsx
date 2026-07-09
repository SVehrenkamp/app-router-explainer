'use client'

// STEP 2: the client half — this is your EXISTING ProductContext, almost
// untouched. Same provider, same hooks, same call sites everywhere in the
// client tree. The only change from the legacy file: the derivation logic
// moved to selectors.ts, so each hook is now locate-then-select. Every
// existing client consumer keeps compiling without edits — that is the
// no-big-bang guarantee.
import { createContext, useContext } from 'react'
import {
  selectDiscountPercent,
  selectDisplayPrice,
  selectName,
  type ProductBundle,
} from '@/lib/product-channel/selectors'

const ProductBundleContext = createContext<ProductBundle | null>(null)

export function ProductBundleProvider({
  bundle,
  children,
}: {
  bundle: ProductBundle
  children: React.ReactNode
}) {
  return (
    <ProductBundleContext.Provider value={bundle}>{children}</ProductBundleContext.Provider>
  )
}

export function useProductBundle(): ProductBundle {
  const bundle = useContext(ProductBundleContext)
  if (!bundle) {
    throw new Error('useProductBundle must be used inside <ProductChannel> (or a legacy provider)')
  }
  return bundle
}

// The selector-hook API your components already use — unchanged signatures.
export const useProductName = () => selectName(useProductBundle())
export const useProductDisplayPrice = () => selectDisplayPrice(useProductBundle())
export const useProductDiscountPercent = () => selectDiscountPercent(useProductBundle())
