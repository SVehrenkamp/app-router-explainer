// The drill-progress engine — pure functions over a versioned document so the
// quiz logic is unit-testable without a browser. The client provider is a thin
// localStorage shell around these. Version the doc: learners keep progress
// across site updates only when the shape is one we still understand.
export type ModuleProgress = { answers: Record<string, boolean>; completedAt: string | null }
export type ProgressDoc = { v: 1; modules: Record<string, ModuleProgress> }

export function emptyProgress(): ProgressDoc {
  return { v: 1, modules: {} }
}

export function parseProgress(raw: string | null): ProgressDoc {
  if (!raw) return emptyProgress()
  try {
    const parsed = JSON.parse(raw) as ProgressDoc
    if (parsed && parsed.v === 1 && typeof parsed.modules === 'object' && parsed.modules) {
      return parsed
    }
  } catch {
    // fall through to empty
  }
  return emptyProgress()
}

export function recordAnswer(
  doc: ProgressDoc,
  moduleSlug: string,
  drillId: string,
  correct: boolean,
  drillCount: number,
  now: string
): ProgressDoc {
  const existing = doc.modules[moduleSlug] ?? { answers: {}, completedAt: null }
  // A drill once answered correctly stays correct — drills are practice, not exams.
  const answers = { ...existing.answers, [drillId]: correct || existing.answers[drillId] === true }
  const correctCount = Object.values(answers).filter(Boolean).length
  const completedAt =
    existing.completedAt ?? (drillCount > 0 && correctCount >= drillCount ? now : null)
  return {
    v: 1,
    modules: { ...doc.modules, [moduleSlug]: { answers, completedAt } },
  }
}

export function moduleProgress(
  doc: ProgressDoc,
  moduleSlug: string,
  drillCount: number
): { answered: number; correct: number; complete: boolean } {
  const mod = doc.modules[moduleSlug]
  if (!mod) return { answered: 0, correct: 0, complete: false }
  const answered = Object.keys(mod.answers).length
  const correct = Object.values(mod.answers).filter(Boolean).length
  return { answered, correct, complete: drillCount > 0 && correct >= drillCount }
}
