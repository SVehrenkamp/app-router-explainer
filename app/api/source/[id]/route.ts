// Serves highlighted source for "Show me the code" from the build-time
// snapshot (scripts/snapshot-source.mts). Highlighting at request time would
// need the repo on disk and shiki in the server bundle — neither exists on
// serverless targets like Cloudflare Workers, so the route is a plain lookup.
// Ids — not paths — cross the network, so the endpoint cannot read arbitrary
// files (see lib/source-registry.ts).
import snapshot from '@/lib/source-snapshot.generated.json'

const SOURCES = snapshot as Record<string, { title: string; html: string }>

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entry = SOURCES[id]
  if (!entry) return Response.json({ error: 'unknown source id' }, { status: 404 })
  return Response.json(entry, { headers: { 'cache-control': 'no-store' } })
}
