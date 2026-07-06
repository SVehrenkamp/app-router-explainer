import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { SOURCE_FILES } from '@/lib/source-registry'

describe('source registry', () => {
  it('every registered source file exists on disk', () => {
    for (const [id, entry] of Object.entries(SOURCE_FILES)) {
      expect(existsSync(path.join(process.cwd(), entry.path)), `${id} → ${entry.path}`).toBe(
        true
      )
    }
  })
})
