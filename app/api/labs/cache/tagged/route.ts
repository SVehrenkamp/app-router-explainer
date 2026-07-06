// Cache Lab target: tag-based invalidation. The data function is cached under
// the 'lab-tagged' tag; the lab's revalidate button busts it on demand. Note
// for the CDN lens: revalidateTag is NOT a surrogate-key purge — it marks the
// Next Data Cache stale; your CDN's copy expires on its own schedule.
import { unstable_cache } from 'next/cache'

const getTaggedPayload = unstable_cache(
  async () => ({ target: 'tagged', generatedAt: new Date().toISOString() }),
  ['lab-tagged-payload'],
  { tags: ['lab-tagged'] }
)

export async function GET() {
  return Response.json(await getTaggedPayload())
}
