'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    getSystemConfig,
    getSystemLogs,
    getSystemLogStats,
    getSystemStatus,
    pruneSystemLogs,
    type LogLevel,
} from '../api'

export function useSystemStatus() {
    return useQuery({
        queryKey: ['system', 'status'],
        queryFn: ({ signal }) => getSystemStatus(signal),
        refetchInterval: 15_000,
    })
}

export function useSystemLogs(limit: number, level?: LogLevel, search?: string) {
    return useQuery({
        queryKey: ['system', 'logs', { limit, level, search }],
        queryFn: ({ signal }) => getSystemLogs(limit, level, search, signal),
        refetchInterval: 30_000,
    })
}

export function useSystemLogStats() {
    return useQuery({
        queryKey: ['system', 'logs', 'stats'],
        queryFn: ({ signal }) => getSystemLogStats(signal),
        refetchInterval: 60_000,
    })
}

export function useSystemConfig() {
    return useQuery({
        queryKey: ['system', 'config'],
        queryFn: ({ signal }) => getSystemConfig(signal),
        staleTime: 60_000,
    })
}

export function usePruneSystemLogs() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: pruneSystemLogs,
        onSuccess: async (result) => {
            const total = result.deletedByAge + result.deletedByCap
            toast.success(
                total > 0
                    ? `Se eliminaron ${total} registros antiguos`
                    : 'No había registros que eliminar',
            )
            await queryClient.invalidateQueries({ queryKey: ['system', 'logs'] })
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'No se pudieron limpiar los registros')),
    })
}
