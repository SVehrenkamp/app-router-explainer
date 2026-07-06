// Parses per-section simulation overrides from a page's searchParams, e.g.
// /store/products/x?delay_reviews=2500&fail_pricing=1
// Reading searchParams opts the route into dynamic rendering — which the PDP
// wants anyway (pricing/inventory are per-request data).
import type { ServiceName } from '@/lib/types'

export type SimOverrides = { delayMs?: number; fail?: boolean }
export type SectionSim = Record<ServiceName, SimOverrides>

const SERVICES: ServiceName[] = ['products', 'pricing', 'inventory', 'reviews']

export function parseSectionSim(
  searchParams: Record<string, string | string[] | undefined>
): SectionSim {
  const sim = {} as SectionSim
  for (const service of SERVICES) {
    const overrides: SimOverrides = {}
    const delay = searchParams[`delay_${service}`]
    if (typeof delay === 'string' && Number.isFinite(Number(delay)) && delay !== '') {
      overrides.delayMs = Number(delay)
    }
    const fail = searchParams[`fail_${service}`]
    if (fail === '1' || fail === 'true') overrides.fail = true
    sim[service] = overrides
  }
  return sim
}
