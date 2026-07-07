// Required by @next/mdx: maps MDX elements to styled components and exposes
// the curriculum embeds inside .mdx files without imports. Element styling
// lives here (no typography plugin in this repo — the map IS the stylesheet):
// display face for headings, ~70ch measure for prose, framed code slabs, and
// the seam for horizontal rules.
import type { MDXComponents } from 'mdx/types'
import { CodeDiff } from '@/components/learn/code-diff'
import { DrillDeck } from '@/components/learn/drill-deck'
import { ModuleEmbed } from '@/components/learn/module-embed'
import { Next16Callout } from '@/components/learn/next16-callout'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: (props) => (
      <h1
        className="mb-6 max-w-[26ch] font-display text-4xl font-bold leading-tight tracking-tight md:text-[2.75rem]"
        {...props}
      />
    ),
    h2: (props) => (
      <h2
        className="mb-4 mt-14 max-w-[36ch] font-display text-2xl font-bold tracking-tight"
        {...props}
      />
    ),
    h3: (props) => <h3 className="mb-2 mt-8 text-lg font-semibold" {...props} />,
    p: (props) => <p className="mb-5 max-w-[70ch] leading-[1.75] text-zinc-700" {...props} />,
    ul: (props) => (
      <ul
        className="mb-5 max-w-[70ch] list-disc space-y-2 pl-6 leading-[1.7] text-zinc-700 marker:text-teal-700"
        {...props}
      />
    ),
    ol: (props) => (
      <ol
        className="mb-5 max-w-[70ch] list-decimal space-y-2 pl-6 leading-[1.7] text-zinc-700 marker:font-mono marker:text-xs marker:text-zinc-400"
        {...props}
      />
    ),
    li: (props) => <li className="pl-1" {...props} />,
    strong: (props) => <strong className="font-semibold text-zinc-900" {...props} />,
    hr: () => <div className="seam my-12 h-[2px] w-24 rounded-full opacity-60" />,
    blockquote: (props) => (
      <blockquote
        className="mb-5 max-w-[70ch] border-l-2 border-teal-700 pl-4 text-zinc-600 italic"
        {...props}
      />
    ),
    table: (props) => (
      <div className="mb-6 overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-xs">
        <table className="w-full text-sm" {...props} />
      </div>
    ),
    th: (props) => (
      <th
        className="border-b border-zinc-200 bg-zinc-50/60 px-4 py-2.5 text-left font-mono text-[11px] font-medium uppercase tracking-wider text-zinc-500"
        {...props}
      />
    ),
    td: (props) => <td className="border-b border-zinc-100 px-4 py-2.5 align-top" {...props} />,
    // Shiki owns pre's className ("shiki github-dark") and inline bg style —
    // merge rather than replace, and neutralize the inline-code chip styling
    // for code that lives inside a block.
    pre: ({ className, ...props }) => (
      <pre
        className={`mb-6 overflow-x-auto rounded-xl p-5 text-[13px] leading-relaxed shadow-lg ring-1 ring-zinc-950/60 [&_code]:rounded-none [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit ${className ?? ''}`}
        {...props}
      />
    ),
    code: (props) => (
      <code
        className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[0.85em] text-zinc-800"
        {...props}
      />
    ),
    ModuleEmbed,
    Next16Callout,
    CodeDiff,
    DrillDeck,
    ...components,
  }
}
