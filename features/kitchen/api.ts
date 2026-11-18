import { apiFetch } from '@/lib/http/client'
import type { OrderKitchenStatus, OrderResponseDto } from '@/features/orders/api'

export const KITCHEN_FLAG = 'digital_kitchen'

export function getKitchenOrders(
    signal?: AbortSignal,
): Promise<OrderResponseDto[]> {
    return apiFetch('/api/orders/kitchen', { signal })
}

export function updateKitchenStatus(
    orderId: string,
    status: OrderKitchenStatus,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/kitchen-status`, {
        method: 'PATCH',
        body: { status },
    })
}
