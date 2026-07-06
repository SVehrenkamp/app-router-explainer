'use client'

import { useXray } from '@/components/xray/provider'

export function XrayToggle() {
  const { enabled, toggle } = useXray()
  return (
    <button
      onClick={toggle}
      data-testid="xray-toggle"
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        enabled ? 'border-violet-600 bg-violet-600 text-white' : 'border-zinc-300 text-zinc-600'
      }`}
    >
      X-ray {enabled ? 'on' : 'off'}
    </button>
  )
}
