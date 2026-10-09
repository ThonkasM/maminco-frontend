'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    getFeatureFlagEvaluation,
    getFeatureFlags,
    updateFeatureFlag,
} from '../api'

const KEYS = {
    all: ['features'] as const,
    evaluate: ['features', 'evaluate'] as const,
}

export function useFeatureFlags() {
    return useQuery({
        queryKey: KEYS.all,
        queryFn: ({ signal }) => getFeatureFlags(signal),
    })
}

/**
 * Evalúa una sola flag (`key -> enabled`) usando `GET /api/features/evaluate`.
 * Si la flag no existe, `enabled` es `false`.
 */
export function useFeatureFlag(key: string) {
    const query = useQuery({
        queryKey: KEYS.evaluate,
        queryFn: ({ signal }) => getFeatureFlagEvaluation(signal),
        staleTime: 60_000,
    })

    return {
        enabled: query.data?.[key] ?? false,
        isLoading: query.isLoading,
    }
}

export function useUpdateFeatureFlag() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ key, enabled }: { key: string; enabled: boolean }) =>
            updateFeatureFlag(key, enabled),
        onSuccess: async (flag) => {
            toast.success(
                flag.enabled
                    ? `Activado: ${flag.name}`
                    : `Desactivado: ${flag.name}`,
            )
            await queryClient.invalidateQueries({ queryKey: KEYS.all })
            await queryClient.invalidateQueries({ queryKey: KEYS.evaluate })
        },
        onError: (error) =>
            toast.error(
                getErrorMessage(error, 'No se pudo actualizar el feature flag'),
            ),
    })
}
