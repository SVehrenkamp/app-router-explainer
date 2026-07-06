// Typed client for the mock microservices — the App Router replacement for the
// data-fetching layer that lived in getInitialProps. Server-only: it never ships
// to the browser, so client bundles carry zero data-fetching plumbing.
import 'server-only'

import { headers } from 'next/headers'

import type { SimOverrides } from '@/lib/sim-params'
import type {
  Inventory,
  Pricing,
  Product,
  ProductPage,
  ReviewSummary,
  ServiceName,
} from '@/lib/types'

export type { SimOverrides }

export type ServiceTiming = { service: ServiceName; ms: number }
export type ServiceResult<T> = { data: T; timing: ServiceTiming }

export class ServiceError extends Error {
  constructor(
    public readonly service: ServiceName,
    public readonly status: number
  ) {
    super(`${service} service responded ${status}`)
    this.name = 'ServiceError'
  }
}

// The mock services live in this same app, so "calling a service" means
// fetching our own origin. That origin differs per environment (next start
// port, wrangler preview on 8787, the deployed workers.dev hostname), so
// derive it from the incoming request instead of hardcoding one. Outside a
// request scope — unit tests, build-time code paths — headers() throws and we
// fall back to localhost; statically prerendered pages must not reach this
// layer at all (they call the data functions in-process, see app/store/page).
async function serviceBase(): Promise<string> {
  if (process.env.SERVICES_BASE_URL) return process.env.SERVICES_BASE_URL
  try {
    const h = await headers()
    const host = h.get('host')
    if (host) return `${h.get('x-forwarded-proto') ?? 'http'}://${host}`
  } catch {
    // not in a request scope
  }
  return 'http://localhost:3000'
}

async function serviceUrl(path: string, sim?: SimOverrides): Promise<string> {
  const url = new URL(path, await serviceBase())
  if (sim?.delayMs !== undefined) url.searchParams.set('delay', String(sim.delayMs))
  if (sim?.fail) url.searchParams.set('fail', '1')
  return url.toString()
}

async function fetchService<T>(
  service: ServiceName,
  path: string,
  init: RequestInit,
  sim?: SimOverrides
): Promise<ServiceResult<T>> {
  const started = performance.now()
  const res = await fetch(await serviceUrl(path, sim), init)
  const ms = Math.round(performance.now() - started)
  if (!res.ok) throw new ServiceError(service, res.status)
  return { data: (await res.json()) as T, timing: { service, ms } }
}

export function getProductsPage(opts?: {
  page?: number
  query?: string
  sim?: SimOverrides
}): Promise<ServiceResult<ProductPage>> {
  const params = new URLSearchParams()
  if (opts?.page) params.set('page', String(opts.page))
  if (opts?.query) params.set('q', opts.query)
  const qs = params.toString()
  return fetchService(
    'products',
    `/api/services/products${qs ? `?${qs}` : ''}`,
    { next: { revalidate: 300, tags: ['products'] } },
    opts?.sim
  )
}

export async function getProductDetail(
  slug: string,
  sim?: SimOverrides
): Promise<ServiceResult<Product> | null> {
  try {
    return await fetchService<Product>(
      'products',
      `/api/services/products/${slug}`,
      { next: { revalidate: 300, tags: ['products'] } },
      sim
    )
  } catch (error) {
    if (error instanceof ServiceError && error.status === 404) return null
    throw error
  }
}

export function getPricing(slug: string, sim?: SimOverrides) {
  return fetchService<Pricing>(
    'pricing',
    `/api/services/pricing/${slug}`,
    { cache: 'no-store' },
    sim
  )
}

export function getInventory(slug: string, sim?: SimOverrides) {
  return fetchService<Inventory>(
    'inventory',
    `/api/services/inventory/${slug}`,
    { cache: 'no-store' },
    sim
  )
}

export function getReviews(slug: string, sim?: SimOverrides) {
  return fetchService<ReviewSummary>(
    'reviews',
    `/api/services/reviews/${slug}`,
    { cache: 'no-store' },
    sim
  )
}
