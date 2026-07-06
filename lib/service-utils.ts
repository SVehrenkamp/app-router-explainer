// Simulation knobs for the mock microservices. Every service route accepts
// ?delay=<ms> and ?fail=1 so demos can make latency and failure visible on demand.
import type { ServiceName } from '@/lib/types'

export const DEFAULT_DELAY_MS: Record<ServiceName, number> = {
  products: 150,
  pricing: 800,
  inventory: 500,
  reviews: 1500,
}

const MAX_DELAY_MS = 10_000

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function parseSimFlags(
  service: ServiceName,
  url: URL
): { delayMs: number; fail: boolean } {
  const raw = url.searchParams.get('delay')
  const parsed = raw === null ? Number.NaN : Number(raw)
  const delayMs =
    Number.isFinite(parsed) && parsed >= 0
      ? Math.min(parsed, MAX_DELAY_MS)
      : DEFAULT_DELAY_MS[service]
  const fail = ['1', 'true'].includes(url.searchParams.get('fail') ?? '')
  return { delayMs, fail }
}

export async function simulateService(
  service: ServiceName,
  request: Request
): Promise<{ delayMs: number; fail: boolean }> {
  const flags = parseSimFlags(service, new URL(request.url))
  await sleep(flags.delayMs)
  return flags
}

export function serviceHeaders(
  service: ServiceName,
  delayMs: number,
  cacheControl: string
): Record<string, string> {
  return {
    'x-service': service,
    'server-timing': `svc;dur=${delayMs}`,
    'cache-control': cacheControl,
  }
}
