// Pricing changes constantly in a real ecommerce stack, so this service is
// deliberately slow (800ms default) and uncacheable — the PDP streams around it.
import { getProduct } from '@/lib/catalog'
import { pricingFor } from '@/lib/service-data'
import { serviceHeaders, simulateService } from '@/lib/service-utils'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { delayMs, fail } = await simulateService('pricing', request)
  if (fail) {
    return Response.json({ error: 'pricing service unavailable' }, { status: 503 })
  }
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return Response.json({ error: 'not found' }, { status: 404 })
  return Response.json(pricingFor(product), {
    headers: serviceHeaders('pricing', delayMs, 'private, no-store'),
  })
}
