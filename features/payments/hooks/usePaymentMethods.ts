'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    listPaymentMethods,
    togglePaymentMethodActive,
    type PaymentMethodDto,
} from '../api'

const KEYS = { all: ['payment-methods'] as const }

export function usePaymentMethods() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: KEYS.all,
        queryFn: ({ signal }) => listPaymentMethods(true, signal),
    })

    const toggleMutation = useMutation({
        mutationFn: ({
            id,
            isActive,
        }: {
            id: string
            isActive: boolean
        }) => togglePaymentMethodActive(id, isActive),
        onSuccess: async (updated) => {
            toast.success(
                `Método ${updated.isActive ? 'activado' : 'desactivado'}`,
            )
            await queryClient.invalidateQueries({ queryKey: KEYS.all })
        },
        onError: (error) =>
            toast.error(
                getErrorMessage(error, 'Error actualizando método de pago'),
            ),
    })

    const handleToggle = async (
        id: string,
        currentStatus: boolean,
    ): Promise<void> => {
        await toggleMutation.mutateAsync({ id, isActive: !currentStatus })
    }

    return {
        methods: query.data ?? ([] as PaymentMethodDto[]),
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando métodos de pago')
            : null,
        handleToggle,
        refresh: () => {
            void query.refetch()
        },
    }
}
