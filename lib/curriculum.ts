// Curriculum registry (minimal — extended with all 12 modules and drill data
// in Plan 4A Task 2).
export type ModuleStatus = 'available' | 'planned'
export type CurriculumModule = {
  slug: string
  number: number
  title: string
  summary: string
  status: ModuleStatus
}

export const MODULES: CurriculumModule[] = [
  {
    slug: 'why-app-router',
    number: 1,
    title: 'Why the App Router',
    summary: 'What it unlocks, and the migration in one picture.',
    status: 'available',
  },
]

export function moduleBySlug(slug: string): CurriculumModule | null {
  return MODULES.find((m) => m.slug === slug) ?? null
}
