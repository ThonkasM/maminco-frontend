'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { getShiftConfig, updateShiftConfig } from './api'

const KEY = ['settings', 'shifts'] as const

export function useShiftConfig(enabled = true) {
    return useQuery({ queryKey: KEY, queryFn: ({ signal }) => getShiftConfig(signal), staleTime: 5 * 60_000, enabled })
}

export function useUpdateShiftConfig() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateShiftConfig,
        onSuccess: async () => {
            toast.success('Los reportes ya usan los nuevos turnos.', 'Turnos guardados')
            await queryClient.invalidateQueries({ queryKey: KEY })
            await queryClient.invalidateQueries({ queryKey: ['reports'] })
            await queryClient.invalidateQueries({ queryKey: ['dashboard'] })
        },
        onError: (error) => toast.error(getErrorMessage(error, 'No se pudieron guardar los turnos.')),
    })
}
