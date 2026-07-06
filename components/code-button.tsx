'use client'

// "Show me the code" — the storefront doubling as browsable reference code.
import { useRef, useState } from 'react'
import type { SourceId } from '@/lib/source-registry'

export function CodeButton({ id, label = 'Show me the code' }: { id: SourceId; label?: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [content, setContent] = useState<{ title: string; html: string } | null>(null)

  async function open() {
    if (!content) {
      const res = await fetch(`/api/source/${id}`)
      if (res.ok) setContent(await res.json())
    }
    dialogRef.current?.showModal()
  }

  return (
    <>
      <button
        onClick={open}
        data-testid={`code-button-${id}`}
        className="text-xs font-medium text-violet-700 hover:underline"
      >
        {'</>'} {label}
      </button>
      <dialog
        ref={dialogRef}
        className="max-h-[80vh] w-[min(56rem,90vw)] rounded-xl p-0 backdrop:bg-black/50"
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-2">
          <span className="text-sm font-medium">{content?.title}</span>
          <button onClick={() => dialogRef.current?.close()} className="text-sm text-zinc-500">
            Close
          </button>
        </div>
        <div
          className="overflow-auto p-4 text-sm [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-4"
          dangerouslySetInnerHTML={{ __html: content?.html ?? '' }}
        />
      </dialog>
    </>
  )
}
