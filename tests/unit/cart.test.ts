import { describe, expect, it } from 'vitest'
import { addItem, cartCount, parseCart, serializeCart, setItemQty } from '@/lib/cart'

describe('cart codec', () => {
  it('round-trips through serialize/parse', () => {
    const items = [{ slug: 'a', qty: 2 }]
    expect(parseCart(serializeCart(items))).toEqual(items)
  })

  it('tolerates garbage cookies', () => {
    expect(parseCart(undefined)).toEqual([])
    expect(parseCart('not json')).toEqual([])
    expect(parseCart('{"nope":1}')).toEqual([])
    expect(parseCart('[{"slug":1,"qty":"x"}]')).toEqual([])
  })

  it('clamps quantities to 1–99 on parse', () => {
    expect(parseCart('[{"slug":"a","qty":500}]')).toEqual([{ slug: 'a', qty: 99 }])
    expect(parseCart('[{"slug":"a","qty":0}]')).toEqual([])
  })

  it('addItem merges duplicate slugs', () => {
    const items = addItem(addItem([], 'a'), 'a')
    expect(items).toEqual([{ slug: 'a', qty: 2 }])
  })

  it('setItemQty updates and removes at zero', () => {
    expect(setItemQty([{ slug: 'a', qty: 1 }], 'a', 3)).toEqual([{ slug: 'a', qty: 3 }])
    expect(setItemQty([{ slug: 'a', qty: 1 }], 'a', 0)).toEqual([])
  })

  it('cartCount sums quantities', () => {
    expect(cartCount([{ slug: 'a', qty: 2 }, { slug: 'b', qty: 1 }])).toBe(3)
  })
})
