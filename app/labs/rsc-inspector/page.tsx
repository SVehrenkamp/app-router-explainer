// RSC Payload Inspector — spec lab §3: what actually travels on a navigation.
import { CodeButton } from '@/components/code-button'
import { RscInspector } from '@/components/labs/rsc-inspector'

export const metadata = { title: 'RSC Payload Inspector' }

export default function RscInspectorPage() {
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="max-w-2xl space-y-2">
          <h1 className="text-3xl font-bold">RSC Payload Inspector</h1>
          <p className="text-zinc-600">
            Fetch a storefront route with the{' '}
            <code className="rounded bg-zinc-100 px-1">RSC: 1</code> header — exactly what the
            router does on navigation — and read the flight payload that comes back, annotated.
          </p>
        </div>
        <CodeButton id="lab-rsc-inspector" />
      </div>
      <RscInspector />
    </section>
  )
}
