// STAGE 1 route file. The only server code here unwraps params and renders the
// banner — the page itself is a single client component (see stage1-pdp.tsx).
import { StageBanner } from '@/components/journey/stage-banner'
import { Stage1PDP } from '@/components/journey/stage1-pdp'
import { JOURNEY_STAGES } from '@/lib/journey'

export const metadata = { title: 'Journey · Stage 1' }

export default async function Stage1Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return (
    <div>
      <StageBanner stage={JOURNEY_STAGES[1]} />
      <Stage1PDP slug={slug} />
    </div>
  )
}
