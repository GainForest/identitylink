'use client'

import { WagmiProvider as WagmiProviderBase } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { wagmiConfig } from '@/lib/wagmi'

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  // Create QueryClient once per app instance
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Keep wallet connection state fresh for reactivity
        staleTime: 0, // Always refetch to catch account changes
        retry: 1,
      },
    },
  }))

  return (
    <WagmiProviderBase config={wagmiConfig} reconnectOnMount>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderBase>
  )
}
