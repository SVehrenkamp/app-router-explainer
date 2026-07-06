import { getProduct } from '@/lib/catalog'
import { inventoryFor } from '@/lib/service-data'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('inventory', request)
  if (fail) {
    return Response.json({ error: 'inventory service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(inventoryFor(product), {
    headers: serviceHeaders('inventory', delayMs, 'private, no-store'),
  })
}
