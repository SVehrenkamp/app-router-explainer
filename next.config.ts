import createMDX from '@next/mdx'
import rehypeShiki from '@shikijs/rehype'
import remarkGfm from 'remark-gfm'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Curriculum modules are .mdx files imported by app/learn/[module].
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
}

const withMDX = createMDX({
  options: {
    // Pipe tables (and the rest of GFM) are NOT core MDX — the curriculum's
    // mapping tables silently render as paragraphs without this plugin.
    remarkPlugins: [remarkGfm],
    // Shiki highlights code blocks AT COMPILE TIME — module prose and code
    // samples ship as HTML, zero client JS. Direct plugin import is fine
    // here: this repo runs webpack for both dev and build.
    rehypePlugins: [[rehypeShiki, { theme: 'github-dark' }]],
  },
})

export default withMDX(nextConfig)
