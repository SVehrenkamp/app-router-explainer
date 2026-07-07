'use client'

// Thin localStorage shell around the pure engine in lib/progress.ts. Reads
// AFTER mount (localStorage is browser-only; client components SSR too), and
// writes through on every recorded answer. The whole quiz brain stays pure
// and unit-tested; this file is just persistence + context.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import {
  emptyProgress,
  parseProgress,
  recordAnswer,
  type ProgressDoc,
} from '@/lib/progress'

const STORAGE_KEY = 'arfg-progress'

type ProgressContextValue = {
  doc: ProgressDoc
  record: (moduleSlug: string, drillId: string, correct: boolean, drillCount: number) => void
}

const ProgressContext = createContext<ProgressContextValue | null>(null)

export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (!value) throw new Error('useProgress must be used inside <ProgressProvider>')
  return value
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [doc, setDoc] = useState<ProgressDoc>(emptyProgress)

  useEffect(() => {
    setDoc(parseProgress(localStorage.getItem(STORAGE_KEY)))
  }, [])

  const record = useCallback(
    (moduleSlug: string, drillId: string, correct: boolean, drillCount: number) => {
      setDoc((prev) => {
        const next = recordAnswer(prev, moduleSlug, drillId, correct, drillCount, new Date().toISOString())
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
    },
    []
  )

  const value = useMemo(() => ({ doc, record }), [doc, record])
  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
}
