'use client'

// Renders nothing. A server component includes <XrayReport .../> in its output;
// when that section streams in and hydrates, the mount effect fires — recording
// WHEN the section resolved and how long its service call took.
import { useEffect } from 'react'
import { useXray, type XrayEntry } from '@/components/xray/provider'

export function XrayReport({ label, kind, serviceMs }: Omit<XrayEntry, 'resolvedAtMs'>) {
  const { report } = useXray()
  useEffect(() => {
    report({ label, kind, serviceMs })
  }, [report, label, kind, serviceMs])
  return null
}
