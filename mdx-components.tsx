// Required by @next/mdx: maps MDX elements to styled components and exposes
// the curriculum embeds inside .mdx files without imports. Element styling
// lives here (no typography plugin in this repo — the map IS the stylesheet).
import type { MDXComponents } from 'mdx/types'
import { CodeDiff } from '@/components/learn/code-diff'
import { DrillDeck } from '@/components/learn/drill-deck'
import { ModuleEmbed } from '@/components/learn/module-embed'
import { Next16Callout } from '@/components/learn/next16-callout'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => <h1 className="mb-4 text-3xl font-bold" {...props} />,
    h2: (props) => <h2 className="mb-3 mt-10 text-2xl font-semibold" {...props} />,
    h3: (props) => <h3 className="mb-2 mt-6 text-lg font-semibold" {...props} />,
    p: (props) => <p className="mb-4 leading-relaxed text-zinc-700" {...props} />,
    ul: (props) => <ul className="mb-4 list-disc space-y-1 pl-6 text-zinc-700" {...props} />,
    ol: (props) => <ol className="mb-4 list-decimal space-y-1 pl-6 text-zinc-700" {...props} />,
    li: (props) => <li className="leading-relaxed" {...props} />,
    table: (props) => (
      <div className="mb-4 overflow-x-auto">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    th: (props) => (
      <th className="border-b border-zinc-300 py-2 pr-4 text-left text-zinc-500" {...props} />
    ),
    td: (props) => <td className="border-b border-zinc-200 py-2 pr-4" {...props} />,
    pre: (props) => (
      <pre
        className="mb-4 overflow-x-auto rounded-xl p-4 text-sm [&>code]:bg-transparent"
        {...props}
      />
    ),
    code: (props) => <code className="rounded bg-zinc-100 px-1 text-sm" {...props} />,
    ModuleEmbed,
    Next16Callout,
    CodeDiff,
    DrillDeck,
    ...components,
  }
}
