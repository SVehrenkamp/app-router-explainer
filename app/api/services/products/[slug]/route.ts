import { getProduct } from '@/lib/catalog'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('products', request)
  if (fail) {
    return Response.json({ error: 'products service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(product, {
    headers: serviceHeaders('products', delayMs, 'public, s-maxage=300, stale-while-revalidate=600'),
  })
}
