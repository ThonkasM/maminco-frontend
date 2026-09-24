'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { getFeatureFlags, updateFeatureFlag } from '../api'

const KEYS = { all: ['features'] as const }

export function useFeatureFlags() {
    return useQuery({
        queryKey: KEYS.all,
        queryFn: ({ signal }) => getFeatureFlags(signal),
    })
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
        },
        onError: (error) =>
            toast.error(
                getErrorMessage(error, 'No se pudo actualizar el feature flag'),
            ),
    })
}
