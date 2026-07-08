// Shared header for stage pages: which stage you are on, where the client
// boundary sits, and the door into this stage's annotated source. Ink bar
// with the seam underneath — the journey IS the brand.
import Link from 'next/link'
import { CodeButton } from '@/components/code-button'
import type { JourneyStage } from '@/lib/journey'

export function StageBanner({ stage }: { stage: JourneyStage }) {
  return (
    <div data-testid="stage-banner" className="mb-8 overflow-hidden rounded-2xl bg-zinc-900 text-white shadow-md">
      <div className="flex flex-wrap items-center gap-3 px-5 py-4">
        <span className="figures rounded-lg bg-white/10 px-2.5 py-1 text-sm font-semibold">
          {stage.stage} / 3
        </span>
        <div>
          <div className="font-display font-semibold tracking-tight">{stage.title}</div>
          <div className="text-xs text-zinc-400">{stage.boundary}</div>
        </div>
        <span className="ml-auto flex items-center gap-3">
          <Link
            href="/journey"
            className="text-sm text-zinc-300 underline decoration-zinc-600 underline-offset-4 hover:text-white"
          >
            Compare stages
          </Link>
          <CodeButton id={stage.sourceId} />
        </span>
      </div>
      <div className="seam h-[3px] w-full" />
    </div>
  )
}
