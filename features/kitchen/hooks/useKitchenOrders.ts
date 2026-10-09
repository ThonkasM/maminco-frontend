'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import type {
    OrderKitchenStatus,
    OrderResponseDto,
} from '@/features/orders/api'
import { getKitchenOrders, updateKitchenStatus } from '../api'

const KITCHEN_KEY = ['kitchen', 'orders'] as const

export function useKitchenOrders() {
    return useQuery({
        queryKey: KITCHEN_KEY,
        queryFn: ({ signal }) => getKitchenOrders(signal),
        refetchInterval: 30_000,
    })
}

export function useUpdateKitchenStatus() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string
            status: OrderKitchenStatus
        }) => updateKitchenStatus(orderId, status),
        onMutate: async ({ orderId, status }) => {
            await queryClient.cancelQueries({ queryKey: KITCHEN_KEY })
            const previous =
                queryClient.getQueryData<OrderResponseDto[]>(KITCHEN_KEY)
            queryClient.setQueryData<OrderResponseDto[]>(
                KITCHEN_KEY,
                (orders) =>
                    (orders ?? []).map((order) =>
                        order.id === orderId
                            ? { ...order, kitchenStatus: status }
                            : order,
                    ),
            )
            return { previous }
        },
        onError: (error, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(KITCHEN_KEY, context.previous)
            }
            toast.error(
                getErrorMessage(error, 'No se pudo actualizar la orden'),
            )
        },
        onSettled: async () => {
            await queryClient.invalidateQueries({ queryKey: KITCHEN_KEY })
        },
    })
}
