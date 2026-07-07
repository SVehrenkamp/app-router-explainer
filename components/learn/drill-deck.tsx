'use client'

// Drill cards with instant feedback — the spec's scenario cards. Answers
// record through the progress provider (and therefore localStorage); a drill
// answered correctly once stays correct, so the deck is practice, not an exam.
// Rendered from MDX via mdx-components.tsx: <DrillDeck module="…" />.
import { useState } from 'react'
import { useProgress } from '@/components/learn/progress-provider'
import { moduleBySlug, type Drill } from '@/lib/curriculum'
import { moduleProgress } from '@/lib/progress'

function DrillCard({
  drill,
  moduleSlug,
  drillCount,
}: {
  drill: Drill
  moduleSlug: string
  drillCount: number
}) {
  const { record } = useProgress()
  const [picked, setPicked] = useState<number | null>(null)

  const answer = (index: number) => {
    if (picked !== null) return
    setPicked(index)
    record(moduleSlug, drill.id, index === drill.answerIndex, drillCount)
  }

  return (
    <div data-testid={`drill-${drill.id}`} className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-violet-600">
        {drill.type.replace(/-/g, ' ')}
      </div>
      <p className="mb-3 font-medium">{drill.prompt}</p>
      <div className="space-y-2">
        {drill.options.map((option, i) => {
          const isAnswer = i === drill.answerIndex
          const isPicked = picked === i
          const style =
            picked === null
              ? 'border-zinc-300 hover:bg-zinc-50'
              : isAnswer
                ? 'border-emerald-500 bg-emerald-50'
                : isPicked
                  ? 'border-red-400 bg-red-50'
                  : 'border-zinc-200 opacity-60'
          return (
            <button
              key={i}
              data-testid="drill-option"
              onClick={() => answer(i)}
              disabled={picked !== null}
              className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${style}`}
            >
              {option}
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p
          data-testid="drill-explanation"
          className={`mt-3 rounded-lg p-3 text-sm ${
            picked === drill.answerIndex ? 'bg-emerald-50 text-emerald-900' : 'bg-amber-50 text-amber-900'
          }`}
        >
          {picked === drill.answerIndex ? 'Right. ' : 'Not quite. '}
          {drill.explanation}
        </p>
      )}
    </div>
  )
}

export function DrillDeck({ module: moduleSlug }: { module: string }) {
  const { doc } = useProgress()
  const mod = moduleBySlug(moduleSlug)
  if (!mod || mod.drills.length === 0) return null
  const progress = moduleProgress(doc, moduleSlug, mod.drills.length)

  return (
    <section className="mt-10 space-y-4">
      <div className="flex items-baseline justify-between">
        <h2 className="text-2xl font-semibold">Drills</h2>
        <span data-testid="deck-score" className="font-mono text-sm text-zinc-600">
          {progress.correct}/{mod.drills.length} correct{progress.complete ? ' ✓' : ''}
        </span>
      </div>
      {mod.drills.map((drill) => (
        <DrillCard
          key={drill.id}
          drill={drill}
          moduleSlug={moduleSlug}
          drillCount={mod.drills.length}
        />
      ))}
    </section>
  )
}
