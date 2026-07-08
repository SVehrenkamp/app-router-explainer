'use client'

// In-place X-ray: wraps a rendered region and, when X-ray mode is on, draws
// its environment on the page — teal dashed outline for server-rendered
// output, indigo for hydrated client islands — with a tag carrying the
// service cost where one exists. Off, it renders children untouched.
//
// Note the shape: this is a CLIENT component that receives SERVER children.
// The highlighter for server content cannot itself be server code (it reads
// context) — so the X-ray implementation is module 4's composition pattern,
// dogfooded: server output flows through a client shell without shipping.
import { useEffect } from 'react'
import { useXray, type XrayEntry } from '@/components/xray/provider'

type XrayRegionProps = Omit<XrayEntry, 'resolvedAtMs'> & { children: React.ReactNode }

export function XrayRegion({ label, kind, serviceMs, children }: XrayRegionProps) {
  const { enabled, report } = useXray()
  useEffect(() => {
    report({ label, kind, serviceMs })
  }, [report, label, kind, serviceMs])

  if (!enabled) return <>{children}</>

  const server = kind === 'server'
  return (
    <div
      data-testid="xray-region"
      className={`relative mt-2 rounded-xl pt-3 outline-2 outline-dashed outline-offset-4 ${
        server ? 'outline-teal-500/60' : 'outline-indigo-500/60'
      }`}
    >
      <span
        data-testid="xray-region-tag"
        className={`absolute -top-3 left-2 z-20 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold leading-4 text-white shadow-sm ${
          server ? 'bg-teal-600' : 'bg-indigo-600'
        }`}
      >
        {kind} · {label}
        {serviceMs !== undefined ? ` · ${serviceMs}ms` : ''}
      </span>
      {children}
    </div>
  )
}
