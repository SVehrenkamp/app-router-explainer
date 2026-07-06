'use client'

// Interactive 'use client' placement over the PDP model. Pure simulation —
// no compilation — but every rule it enforces is one the compiler or runtime
// enforces for real (async-under-client, hooks, serialization).
import { useMemo, useState } from 'react'
import { PDP_TREE, STAGE_PRESETS } from '@/lib/boundary-model'
import { simulateBoundary, type BoundaryNode } from '@/lib/boundary-sim'

function NodeRow({
  node,
  depth,
  clientIds,
  clientRoots,
  onToggle,
}: {
  node: BoundaryNode
  depth: number
  clientIds: Set<string>
  clientRoots: Set<string>
  onToggle: (id: string) => void
}) {
  const isClient = clientIds.has(node.id)
  return (
    <>
      <div
        data-testid={`boundary-node-${node.id}`}
        className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
          isClient ? 'bg-sky-50 text-sky-900' : 'bg-emerald-50 text-emerald-900'
        }`}
        style={{ marginLeft: depth * 20 }}
      >
        <label className="flex items-center gap-1 font-mono text-xs">
          <input
            type="checkbox"
            data-testid={`boundary-toggle-${node.id}`}
            checked={clientRoots.has(node.id)}
            onChange={() => onToggle(node.id)}
          />
          &apos;use client&apos;
        </label>
        <span className="font-medium">{node.name}</span>
        <span className="ml-auto font-mono text-xs text-zinc-500">
          {node.nature === 'async-server'
            ? 'async · server data'
            : node.nature === 'hooks'
              ? 'uses hooks'
              : ''}{' '}
          · {node.kb}KB
        </span>
        <span className="rounded px-1.5 py-0.5 text-xs font-semibold uppercase">
          {isClient ? 'client' : 'server'}
        </span>
      </div>
      {(node.children ?? []).map((child) => (
        <NodeRow
          key={child.id}
          node={child}
          depth={depth + 1}
          clientIds={clientIds}
          clientRoots={clientRoots}
          onToggle={onToggle}
        />
      ))}
    </>
  )
}

export function BoundaryExplorer() {
  const [clientRoots, setClientRoots] = useState<Set<string>>(
    () => new Set(STAGE_PRESETS['stage-3'])
  )
  const result = useMemo(() => simulateBoundary(PDP_TREE, clientRoots), [clientRoots])

  const toggle = (id: string) =>
    setClientRoots((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
      <div className="space-y-1">
        <div className="mb-2 flex gap-2">
          {(['stage-1', 'stage-2', 'stage-3'] as const).map((preset) => (
            <button
              key={preset}
              data-testid={`preset-${preset}`}
              onClick={() => setClientRoots(new Set(STAGE_PRESETS[preset]))}
              className="rounded-lg border border-zinc-300 px-3 py-1 text-sm hover:bg-zinc-100"
            >
              {preset.replace('-', ' ')}
            </button>
          ))}
        </div>
        <NodeRow
          node={PDP_TREE}
          depth={0}
          clientIds={result.clientIds}
          clientRoots={clientRoots}
          onToggle={toggle}
        />
      </div>
      <aside className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="text-xs uppercase tracking-wide text-zinc-500">Estimated client JS</div>
          <div data-testid="boundary-kb" className="text-3xl font-bold">
            {result.clientKB}
          </div>
          <div className="text-xs text-zinc-500">
            KB (component estimates anchored to measured journey bundles)
          </div>
        </div>
        <div
          data-testid="boundary-violations"
          className="rounded-xl border border-zinc-200 bg-white p-4 text-sm"
        >
          <div className="mb-2 text-xs uppercase tracking-wide text-zinc-500">What breaks</div>
          {result.violations.length === 0 ? (
            <p className="text-emerald-700">No violations — this boundary placement is legal.</p>
          ) : (
            <ul className="space-y-2">
              {result.violations.map((v, i) => (
                <li
                  key={`${v.nodeId}-${v.kind}-${i}`}
                  className="rounded bg-red-50 p-2 text-red-800"
                >
                  {v.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}
