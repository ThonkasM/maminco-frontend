'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    getAiHealth,
    getAnomalies,
    getMetricsSummary,
    getPeakHours,
    getProductForecast,
    getSalesForecast,
    trainModels,
} from '../api'

const KEYS = {
    health: ['ai', 'health'] as const,
    metrics: ['ai', 'metrics'] as const,
    sales: (horizon: number) => ['ai', 'sales', horizon] as const,
    products: (horizon: number, limit: number) =>
        ['ai', 'products', horizon, limit] as const,
    peakHours: ['ai', 'peak-hours'] as const,
    anomalies: ['ai', 'anomalies'] as const,
}

export function useAiHealth() {
    return useQuery({
        queryKey: KEYS.health,
        queryFn: ({ signal }) => getAiHealth(signal),
        retry: false,
        staleTime: 30_000,
    })
}

export function useAiMetrics() {
    return useQuery({
        queryKey: KEYS.metrics,
        queryFn: ({ signal }) => getMetricsSummary(signal),
        staleTime: 60_000,
    })
}

export function useSalesForecast(horizon: number) {
    return useQuery({
        queryKey: KEYS.sales(horizon),
        queryFn: ({ signal }) => getSalesForecast(horizon, signal),
        staleTime: 60_000,
    })
}

export function useProductForecast(horizon: number, limit: number) {
    return useQuery({
        queryKey: KEYS.products(horizon, limit),
        queryFn: ({ signal }) => getProductForecast(horizon, limit, signal),
        staleTime: 60_000,
    })
}

export function usePeakHours() {
    return useQuery({
        queryKey: KEYS.peakHours,
        queryFn: ({ signal }) => getPeakHours(signal),
        staleTime: 60_000,
    })
}

export function useAnomalies() {
    return useQuery({
        queryKey: KEYS.anomalies,
        queryFn: ({ signal }) => getAnomalies(signal),
        staleTime: 60_000,
    })
}

export function useTrainModels() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: trainModels,
        onSuccess: async (result) => {
            if (result.ok) {
                toast.success('Modelos reentrenados correctamente')
            } else {
                toast.error(result.message || 'No se pudo reentrenar')
            }
            await queryClient.invalidateQueries({ queryKey: ['ai'] })
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error al reentrenar los modelos')),
    })
}
