// Cache Lab target: timed revalidation. Served from cache, regenerated in the
// background at most every 10s — watch generatedAt step forward in chunks.
export const revalidate = 10

export async function GET() {
  return Response.json({ target: 'revalidate', generatedAt: new Date().toISOString() })
}
