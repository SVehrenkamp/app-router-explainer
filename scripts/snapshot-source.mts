// Build-time source snapshot for the "Show me the code" API.
//
// The source route used to read repo files and run shiki at request time,
// which only works where the repo is on disk next to the server. Deploy
// targets like Cloudflare Workers ship a bundle, not the repo — so the
// highlighting happens here, at build, and the route serves the generated
// JSON. Run via `yarn snapshot` (wired into `dev` and `build`).
//
// Runs under `node --experimental-strip-types` so it can import the typed
// registry directly; the flag is a no-op on Node >= 23.6 where stripping is
// the default.
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { codeToHtml } from 'shiki'

import { SOURCE_FILES } from '../lib/source-registry.ts'

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
const out: Record<string, { title: string; html: string }> = {}

for (const [id, entry] of Object.entries(SOURCE_FILES)) {
  const code = await readFile(path.join(root, entry.path), 'utf8')
  out[id] = {
    title: entry.title,
    html: await codeToHtml(code, {
      lang: entry.path.endsWith('.tsx') ? 'tsx' : 'ts',
      theme: 'github-dark',
    }),
  }
}

const dest = path.join(root, 'lib/source-snapshot.generated.json')
await writeFile(dest, JSON.stringify(out))
console.log(`snapshot: ${Object.keys(out).length} source files -> ${path.relative(root, dest)}`)
