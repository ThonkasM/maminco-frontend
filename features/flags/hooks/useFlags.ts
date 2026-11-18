'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    getFeatureFlagEvaluation,
    getFeatureFlags,
    updateFeatureFlag,
} from '../api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = {
    all: ['features'] as const,
    evaluate: ['features', 'evaluate'] as const,
}

export function useFeatureFlags() {
    return useQuery({
        queryKey: KEYS.all,
        staleTime: STALE_TIME.reference,
        queryFn: ({ signal }) => getFeatureFlags(signal),
    })
}

export function useFeatureFlag(key: string) {
    const query = useQuery({
        queryKey: KEYS.evaluate,
        queryFn: ({ signal }) => getFeatureFlagEvaluation(signal),
        staleTime: STALE_TIME.reference,
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
                    ? `«${flag.name}» ya está disponible para el equipo.`
                    : `«${flag.name}» quedó apagada para todos.`,
                flag.enabled ? 'Función activada' : 'Función desactivada',
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
