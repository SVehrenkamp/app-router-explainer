// Serves highlighted source for "Show me the code". Reads from disk at request
// time — fine on the Node server this site runs on (README notes the repo must
// be present, i.e. don't deploy this route to a serverless bundle without it).
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { codeToHtml } from 'shiki'
import { SOURCE_FILES } from '@/lib/source-registry'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const entry = SOURCE_FILES[id as keyof typeof SOURCE_FILES]
  if (!entry) return Response.json({ error: 'unknown source id' }, { status: 404 })

  const code = await readFile(path.join(process.cwd(), entry.path), 'utf8')
  const html = await codeToHtml(code, {
    lang: entry.path.endsWith('.tsx') ? 'tsx' : 'ts',
    theme: 'github-dark',
  })
  return Response.json({ title: entry.title, html }, { headers: { 'cache-control': 'no-store' } })
}
