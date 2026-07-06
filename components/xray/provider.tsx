'use client'

// X-ray mode's registry. Server components can't hold client state, so streamed
// sections report themselves by rendering a tiny client leaf (XrayReport) that
// logs into this context on mount — turning invisible streaming into data.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

export type XrayEntry = {
  label: string
  kind: 'server' | 'client'
  serviceMs?: number
  resolvedAtMs: number
}

type XrayContextValue = {
  enabled: boolean
  toggle: () => void
  clear: () => void
  entries: XrayEntry[]
  report: (entry: Omit<XrayEntry, 'resolvedAtMs'>) => void
}

const XrayContext = createContext<XrayContextValue | null>(null)

export function useXray(): XrayContextValue {
  const value = useContext(XrayContext)
  if (!value) throw new Error('useXray must be used inside <XrayProvider>')
  return value
}

export function XrayProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState(false)
  const [entries, setEntries] = useState<XrayEntry[]>([])

  // localStorage is browser-only — reading it in render would break SSR of this
  // client component (client components render on the server too!).
  useEffect(() => {
    setEnabled(localStorage.getItem('xray') === '1')
  }, [])

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      localStorage.setItem('xray', prev ? '0' : '1')
      return !prev
    })
  }, [])

  const clear = useCallback(() => setEntries([]), [])

  const report = useCallback((entry: Omit<XrayEntry, 'resolvedAtMs'>) => {
    setEntries((prev) =>
      prev.some((e) => e.label === entry.label)
        ? prev
        : [...prev, { ...entry, resolvedAtMs: Math.round(performance.now()) }]
    )
  }, [])

  const value = useMemo(
    () => ({ enabled, toggle, clear, entries, report }),
    [enabled, toggle, clear, entries, report]
  )
  return <XrayContext.Provider value={value}>{children}</XrayContext.Provider>
}
