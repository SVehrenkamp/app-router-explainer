// Shared header for stage pages: which stage you are on, where the client
// boundary sits, and the door into this stage's annotated source.
import Link from 'next/link'
import { CodeButton } from '@/components/code-button'
import type { JourneyStage } from '@/lib/journey'

export function StageBanner({ stage }: { stage: JourneyStage }) {
  return (
    <div
      data-testid="stage-banner"
      className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3"
    >
      <span className="rounded bg-violet-600 px-2 py-0.5 text-xs font-semibold text-white">
        Stage {stage.stage} of 3
      </span>
      <span className="text-sm font-medium text-violet-900">{stage.title}</span>
      <span className="text-sm text-violet-700">· {stage.boundary}</span>
      <span className="ml-auto flex items-center gap-2">
        <Link href="/journey" className="text-sm text-violet-700 underline">
          Compare stages
        </Link>
        <CodeButton id={stage.sourceId} />
      </span>
    </div>
  )
}
