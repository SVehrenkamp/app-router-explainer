// Course shell — the spec's learn/layout.tsx: persistent sidebar with
// per-module progress. The layout is a server component; progress state
// lives in the client provider it renders (server parents, client children).
import { CourseSidebar } from '@/components/learn/course-sidebar'
import { ProgressProvider } from '@/components/learn/progress-provider'

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <div className="grid gap-8 md:grid-cols-[260px_1fr]">
        <aside>
          <div className="mb-3 px-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Curriculum
          </div>
          <CourseSidebar />
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
    </ProgressProvider>
  )
}
