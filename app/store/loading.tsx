// loading.tsx = an automatic Suspense boundary around the page. The Pages Router
// had no equivalent: you either blocked navigation or hand-rolled spinners.
import { GridSkeleton } from '@/components/skeletons'

export default function StoreLoading() {
  return <GridSkeleton />
}
