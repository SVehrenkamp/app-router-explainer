// Cache Lab target: dynamic. Every request renders; no cache layer touches it.
export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    { target: 'dynamic', generatedAt: new Date().toISOString() },
    { headers: { 'cache-control': 'private, no-store' } }
  )
}
