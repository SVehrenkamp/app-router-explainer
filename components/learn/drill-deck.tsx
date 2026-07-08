'use client'

// Drill cards with instant feedback — the spec's scenario cards. Answers
// record through the progress provider (and therefore localStorage); a drill
// answered correctly once stays correct, so the deck is practice, not an exam.
// Rendered from MDX via mdx-components.tsx: <DrillDeck module="…" />.
import { useState } from 'react'
import { useProgress } from '@/components/learn/progress-provider'
import { moduleBySlug, type Drill } from '@/lib/curriculum'
import { moduleProgress } from '@/lib/progress'

const LETTERS = ['A', 'B', 'C', 'D', 'E']

function DrillCard({
  drill,
  index,
  moduleSlug,
  drillCount,
}: {
  drill: Drill
  index: number
  moduleSlug: string
  drillCount: number
}) {
  const { record } = useProgress()
  const [picked, setPicked] = useState<number | null>(null)

  const answer = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    record(moduleSlug, drill.id, i === drill.answerIndex, drillCount)
  }

  return (
    <div
      data-testid={`drill-${drill.id}`}
      className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="figures text-xs text-zinc-400">{String(index + 1).padStart(2, '0')}</span>
        <span className="rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] uppercase tracking-wider text-zinc-500">
          {drill.type.replace(/-/g, ' ')}
        </span>
      </div>
      <p className="mb-4 font-medium leading-relaxed">{drill.prompt}</p>
      <div className="space-y-2">
        {drill.options.map((option, i) => {
          const isAnswer = i === drill.answerIndex
          const isPicked = picked === i
          const style =
            picked === null
              ? 'border-zinc-200 hover:border-zinc-400 hover:bg-zinc-50'
              : isAnswer
                ? 'border-teal-600 bg-teal-50 text-teal-950'
                : isPicked
                  ? 'border-red-300 bg-red-50 text-red-900'
                  : 'border-zinc-100 opacity-50'
          return (
            <button
              key={i}
              data-testid="drill-option"
              onClick={() => answer(i)}
              disabled={picked !== null}
              className={`flex w-full items-baseline gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-relaxed transition-all ${style}`}
            >
              <span className="figures shrink-0 text-xs text-zinc-400">{LETTERS[i]}</span>
              <span>{option}</span>
            </button>
          )
        })}
      </div>
      {picked !== null && (
        <p
          data-testid="drill-explanation"
          className={`mt-4 rounded-xl p-4 text-sm leading-relaxed ${
            picked === drill.answerIndex
              ? 'bg-teal-50 text-teal-950'
              : 'bg-amber-50 text-amber-950'
          }`}
        >
          <span className="font-semibold">
            {picked === drill.answerIndex ? 'Right. ' : 'Not quite. '}
          </span>
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
    <section className="mt-14 space-y-4">
      <div className="seam h-[2px] w-24 rounded-full opacity-60" />
      <div className="flex items-baseline justify-between">
        <h2 className="font-display text-2xl font-bold tracking-tight">Drills</h2>
        <span data-testid="deck-score" className="figures text-sm text-zinc-500">
          {progress.correct}/{mod.drills.length} correct{progress.complete ? ' ✓' : ''}
        </span>
      </div>
      {mod.drills.map((drill, i) => (
        <DrillCard
          key={drill.id}
          drill={drill}
          index={i}
          moduleSlug={moduleSlug}
          drillCount={mod.drills.length}
        />
      ))}
    </section>
  )
}
