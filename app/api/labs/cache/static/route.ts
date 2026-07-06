// Cache Lab target: static. force-static opts a route handler into the Full
// Route Cache — generatedAt freezes after the first render.
export const dynamic = 'force-static'

export async function GET() {
  return Response.json({ target: 'static', generatedAt: new Date().toISOString() })
}
