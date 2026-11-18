'use client'
import { useQueryClient } from '@tanstack/react-query'
import type { OrderKitchenStatus, OrderResponseDto } from '@/features/orders/api'
import { useOrdersSocket } from '@/lib/realtime/useOrdersSocket'

const KITCHEN_KEY = ['kitchen', 'orders'] as const

export function useKitchenSocket() {
    const queryClient = useQueryClient()

    const refresh = () => {
        void queryClient.invalidateQueries({ queryKey: KITCHEN_KEY })
    }

    useOrdersSocket({
        subscribeToKitchen: true,
        onConnect: refresh,
        on: {
            'order:created': refresh,
            'order:item:added': refresh,
            'order:item:removed': refresh,
            'order:item:updated': refresh,
            'order:status:changed': refresh,
            'kitchen:orders:snapshot': ({ orders }) => {
                queryClient.setQueryData(KITCHEN_KEY, orders as OrderResponseDto[])
            },
            'order:kitchen-status:changed': ({ orderId, kitchenStatus }) => {
                queryClient.setQueryData<OrderResponseDto[]>(KITCHEN_KEY, (orders) =>
                    orders?.map((order) =>
                        order.id === orderId
                            ? { ...order, kitchenStatus: kitchenStatus as OrderKitchenStatus }
                            : order,
                    ),
                )
            },
        },
    })
}
