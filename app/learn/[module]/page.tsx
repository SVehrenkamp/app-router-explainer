// Curriculum route: a static import map keyed by slug. generateStaticParams
// prerenders every available module; unknown slugs 404. MDX compiles to
// server components — module prose ships as HTML, not JS.
import type { ComponentType } from 'react'
import { notFound } from 'next/navigation'
import { MODULES, moduleBySlug } from '@/lib/curriculum'

const CONTENT: Record<string, () => Promise<{ default: ComponentType }>> = {
  'why-app-router': () => import('@/content/modules/01-why-app-router.mdx'),
  'mental-model': () => import('@/content/modules/02-mental-model.mdx'),
  'routing-layouts': () => import('@/content/modules/03-routing-layouts.mdx'),
  'server-components-boundary': () => import('@/content/modules/04-server-components-boundary.mdx'),
  'hooks-client-patterns': () => import('@/content/modules/05-hooks-client-patterns.mdx'),
  'data-fetching': () => import('@/content/modules/06-data-fetching.mdx'),
  'caching-cdn': () => import('@/content/modules/07-caching-cdn.mdx'),
  'streaming-suspense': () => import('@/content/modules/08-streaming-suspense.mdx'),
}

export function generateStaticParams() {
  return MODULES.filter((m) => m.status === 'available').map((m) => ({ module: m.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params
  return { title: moduleBySlug(slug)?.title ?? 'Module' }
}

export default async function ModulePage({ params }: { params: Promise<{ module: string }> }) {
  const { module: slug } = await params
  const load = CONTENT[slug]
  if (!load) notFound()
  const { default: Content } = await load()
  return (
    <article className="max-w-3xl">
      <Content />
    </article>
  )
}
