'use client'

import { QueryClient, QueryClientProvider, MutationCache, QueryCache } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import AuthService from '@/services/auth.service'

export default function QueryProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
              // Don't retry on 401 errors
              if (error?.response?.status === 401) {
                return false
              }
              return failureCount < 2
            },
          },
          mutations: {
            retry: (failureCount, error: any) => {
              // Don't retry on 401 errors
              if (error?.response?.status === 401) {
                return false
              }
              return failureCount < 1
            },
          },
        },
        queryCache: new QueryCache({
          onError: (error: any) => {
            if (error?.response?.status === 401) {
              queryClient.clear()
            }
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: any) => {
            if (error?.response?.status === 401) {
              queryClient.clear()
            }
          },
        }),
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
