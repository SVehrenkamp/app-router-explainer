'use client'

import { useXray } from '@/components/xray/provider'

export function XrayToggle() {
  const { enabled, toggle } = useXray()
  return (
    <button
      onClick={toggle}
      data-testid="xray-toggle"
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        enabled ? 'seam border-transparent text-white shadow-sm' : 'border-zinc-300 bg-white text-zinc-600 hover:border-zinc-500'
      }`}
    >
      X-ray {enabled ? 'on' : 'off'}
    </button>
  )
}
