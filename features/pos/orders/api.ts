import { ApiError, apiFetch } from '@/lib/http/client'

// ============ TYPES ============

export type OrderStatus = 'DRAFT' | 'CLOSED' | 'CANCELLED'
export type ServiceType = 'MESA' | 'DELIVERY' | 'RECOGER'

export interface OrderItemResponseDto {
    id: string
    productId: string
    productName: string
    quantity: number
    unitPrice: number
    discountAmount: number
    subtotal: number
    notes?: string
    addedById: string
    addedByName: string
    createdAt: string
}

export interface OrderResponseDto {
    id: string
    orderNumber: string
    status: OrderStatus
    serviceType: ServiceType

    // Montos
    subtotal: number
    discountAmount: number
    tipAmount: number
    total: number

    // Mesa
    tableId: string
    tableName: string
    areaId: string

    // Usuarios
    createdById: string
    createdByName: string
    attendedById?: string
    attendedByName?: string
    closedById?: string
    closedByName?: string

    // Items
    items: OrderItemResponseDto[]
    itemCount: number

    // Timestamps
    createdAt: string
    updatedAt: string
    closedAt?: string
}

export interface PaginatedOrdersResponse {
    data: OrderResponseDto[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface CreateOrderPayload {
    tableId: string
    createdById: string
    attendedById?: string
    initialItems?: Array<{
        productId: string
        quantity: number
        notes?: string
    }>
}

export interface AddOrderItemPayload {
    productId: string
    quantity: number
    notes?: string
}

export interface ChangeOrderStatusPayload {
    status: OrderStatus
}

export interface ApplyDiscountPayload {
    percentageDiscount?: number
    fixedDiscount?: number
    reason?: string
}

export interface OrderFilters {
    status?: OrderStatus
    tableId?: string
    serviceType?: ServiceType
    createdById?: string
    onlyOpen?: boolean
    sortBy?: 'createdAt' | 'total' | 'status'
    sortOrder?: 'asc' | 'desc'
}

// ============ API FUNCTIONS ============

export function createOrder(
    payload: CreateOrderPayload,
): Promise<OrderResponseDto> {
    return apiFetch('/api/orders', { method: 'POST', body: payload })
}

/**
 * Crea la orden si no existe, o retorna la activa de la mesa.
 * El serviceType se asigna automáticamente en el backend según table.area.name.
 */
export async function createOrderIfNotExists(
    tableId: string,
    userId: string,
): Promise<OrderResponseDto> {
    const activeOrder = await getActiveOrderByTable(tableId)
    if (activeOrder) return activeOrder

    let lastError: unknown = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await createOrder({ tableId, createdById: userId })
        } catch (error) {
            lastError = error
            if (attempt === maxRetries) throw error

            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            await new Promise((resolve) => setTimeout(resolve, delayMs))
        }
    }

    throw lastError ?? new Error('Unknown error creating order')
}

export function getOrders(
    page = 1,
    limit = 10,
    filters?: OrderFilters,
    signal?: AbortSignal,
): Promise<PaginatedOrdersResponse> {
    return apiFetch('/api/orders', {
        query: {
            page,
            limit,
            status: filters?.status,
            tableId: filters?.tableId,
            serviceType: filters?.serviceType,
            createdById: filters?.createdById,
            onlyOpen: filters?.onlyOpen,
            sortBy: filters?.sortBy,
            sortOrder: filters?.sortOrder,
        },
        signal,
    })
}

export function getOrderById(
    id: string,
    signal?: AbortSignal,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${id}`, { signal })
}

/**
 * Obtiene la orden activa (DRAFT) de una mesa.
 * Retorna null si no hay orden abierta.
 */
export async function getActiveOrderByTable(
    tableId: string,
    signal?: AbortSignal,
): Promise<OrderResponseDto | null> {
    try {
        return await apiFetch<OrderResponseDto | null>(
            `/api/orders/table/${tableId}/active`,
            { signal },
        )
    } catch (error) {
        if (error instanceof ApiError && error.status === 404) return null
        throw error
    }
}

export function changeOrderStatus(
    orderId: string,
    payload: ChangeOrderStatusPayload,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: payload,
    })
}

export function addOrderItem(
    orderId: string,
    payload: AddOrderItemPayload,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/items`, {
        method: 'POST',
        body: payload,
    })
}

export function updateOrderItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
    notes?: string,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        body: { quantity, notes },
    })
}

export function removeOrderItem(
    orderId: string,
    itemId: string,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
    })
}

export function applyDiscount(
    orderId: string,
    payload: ApplyDiscountPayload,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/discount`, {
        method: 'PATCH',
        body: payload,
    })
}

export function addTip(
    orderId: string,
    tipAmount: number,
): Promise<OrderResponseDto> {
    return apiFetch(`/api/orders/${orderId}/tip`, {
        method: 'PATCH',
        body: { tipAmount },
    })
}

export function getRevenueStats(signal?: AbortSignal): Promise<unknown> {
    return apiFetch('/api/orders/stats/revenue', { signal })
}

export function getOrdersByStatus(signal?: AbortSignal): Promise<unknown> {
    return apiFetch('/api/orders/stats/by-status', { signal })
}

export function getOrdersByServiceType(signal?: AbortSignal): Promise<unknown> {
    return apiFetch('/api/orders/stats/by-service-type', { signal })
}
