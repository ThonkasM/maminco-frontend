'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getClosureStatus, listClosures, runClosure } from './api'

export const CLOSURE_KEYS = { status: ['closures', 'status'] as const, list: ['closures', 'list'] as const }

export function useClosureStatus(enabled = true) {
    return useQuery({
        queryKey: CLOSURE_KEYS.status,
        queryFn: ({ signal }) => getClosureStatus(signal),
        enabled,
        refetchInterval: 5 * 60_000,
        refetchOnWindowFocus: true,
        retry: false,
    })
}

export function useClosures() {
    return useQuery({ queryKey: CLOSURE_KEYS.list, queryFn: ({ signal }) => listClosures(signal) })
}

export function useRunClosure() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: runClosure,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['closures'] })
            await queryClient.invalidateQueries({ queryKey: ['repository'] })
        },
    })
}
