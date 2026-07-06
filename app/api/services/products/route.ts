// Mock "product catalog" microservice. In production this is a separate deployable
// behind Fastly; here it is a route handler so the whole demo is self-contained.
import { listProducts } from '@/lib/catalog'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(request: Request) {
  const { delayMs, fail } = await simulateService('products', request)
  if (fail) {
    return Response.json({ error: 'products service unavailable' }, { status: 503 })
  }
  const { searchParams } = new URL(request.url)
  const page = listProducts({
    page: Number(searchParams.get('page') ?? '1') || 1,
    pageSize: Number(searchParams.get('pageSize') ?? '') || undefined,
    query: searchParams.get('q') ?? undefined,
  })
  return Response.json(page, {
    headers: serviceHeaders('products', delayMs, 'public, s-maxage=300, stale-while-revalidate=600'),
  })
}
