'use client'

// In the Pages Router this provider lived in _app.tsx. Here it is a client
// component that the (server) root layout wraps around the app — a server
// component may freely render client children.
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // useState(() => ...) gives one client per browser session but a FRESH client
  // per server render — never share a QueryClient across requests on the server.
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 } } })
  )
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
