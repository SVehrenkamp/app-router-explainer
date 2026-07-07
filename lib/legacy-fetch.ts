// Data plumbing for the LEGACY (Pages Router) half of the app. This is the
// "before" world: getInitialProps runs on the server for the first hit and in
// the browser on client navigations, so every fetch must work from both sides
// — the exact awkwardness that App Router server components erase.
//
// Deliberately NOT lib/services.ts: that client is App-Router-only (it reads
// next/headers). Pages Router code gets the request object handed to it
// instead — plumb it through or lose the host.
export type LegacyReq = { headers: Partial<Record<string, string | string[]>> }

export function legacyServiceBase(req?: LegacyReq): string {
  if (typeof window !== 'undefined') return ''
  const host = typeof req?.headers.host === 'string' ? req.headers.host : undefined
  if (host) {
    const proto =
      typeof req?.headers['x-forwarded-proto'] === 'string'
        ? req.headers['x-forwarded-proto']
        : 'http'
    return `${proto}://${host}`
  }
  return 'http://localhost:3000'
}

export async function fetchLegacyJson<T>(path: string, req?: LegacyReq): Promise<T> {
  const res = await fetch(`${legacyServiceBase(req)}${path}`)
  if (!res.ok) throw new Error(`${path} responded ${res.status}`)
  return (await res.json()) as T
}
