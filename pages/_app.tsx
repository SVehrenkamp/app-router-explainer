// _app.tsx — the Pages Router's ONLY shared shell, re-rendered on every
// navigation. Global CSS may only be imported here (a rule the App Router
// drops). Compare app/providers.tsx + app/layout.tsx: the provider survives
// as a client component; the shell becomes a persistent server layout.
// This file exists so pages/legacy/* runs beside app/* — the coexistence story.
import '@/app/globals.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function LegacyApp({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
    </QueryClientProvider>
  )
}
