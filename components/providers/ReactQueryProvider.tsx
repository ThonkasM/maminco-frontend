"use client"
import React, { ReactNode } from 'react'
import { QueryClient, QueryClientProvider, hydrate } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
