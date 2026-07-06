'use client'

// React error boundaries are STILL class components — and they must be client
// components. When a streamed server section throws, the error travels down the
// stream and the nearest client boundary catches it. Place the boundary OUTSIDE
// the <Suspense> it protects: ErrorBoundary > Suspense > async section.
import { Component, type ReactNode } from 'react'

type Props = { fallback: ReactNode; children: ReactNode }
type State = { hasError: boolean }

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
