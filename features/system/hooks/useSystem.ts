'use client'
import { useQuery } from '@tanstack/react-query'
import { getSystemConfig, getSystemLogs, getSystemStatus, type LogLevel } from '../api'

export function useSystemStatus() {
    return useQuery({
        queryKey: ['system', 'status'],
        queryFn: ({ signal }) => getSystemStatus(signal),
        refetchInterval: 15_000,
    })
}

export function useSystemLogs(limit: number, level?: LogLevel) {
    return useQuery({
        queryKey: ['system', 'logs', { limit, level }],
        queryFn: ({ signal }) => getSystemLogs(limit, level, signal),
        refetchInterval: 30_000,
    })
}

export function useSystemConfig() {
    return useQuery({
        queryKey: ['system', 'config'],
        queryFn: ({ signal }) => getSystemConfig(signal),
        staleTime: 60_000,
    })
}
