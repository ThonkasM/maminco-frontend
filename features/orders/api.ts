import { apiFetch } from '@/lib/http/client'

import type { OrderKitchenStatus, OrderStatus } from '@/lib/types/enums'

export type { OrderKitchenStatus, OrderStatus }
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
    kitchenStatus: OrderKitchenStatus
    serviceType: ServiceType
    subtotal: number
    discountAmount: number
    tipAmount: number
    total: number
    tableId: string
    tableName: string
    areaId: string
    createdById: string
    createdByName: string
    attendedById?: string
    attendedByName?: string
    closedById?: string
    closedByName?: string
    items: OrderItemResponseDto[]
    itemCount: number
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
    kitchenStatus?: OrderKitchenStatus
    tableId?: string
    serviceType?: ServiceType
    createdById?: string
    onlyOpen?: boolean
    sortBy?: 'createdAt' | 'total' | 'status'
    sortOrder?: 'asc' | 'desc'
}

export interface OrderHistoryEntry {
    id: string
    action: string
    description: string
    metadata: unknown
    user: {
        id: string
        name: string
        email: string
    }
    createdAt: string
    timestamp: string
}

export interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
}

export interface OrderHistoryResponse {
    id: string
    orderNumber: string
    status: string
    tableName: string
    areaName: string
    createdAt: string
    pagination: PaginationInfo
    history: OrderHistoryEntry[]
}

export interface OrderHistoryTimelineEntry {
    id: string
    timestamp: string
    time: string
    user: string
    emoji: string
    action: string
    description: string
    detail: string
    metadata?: unknown
}

export interface OrderHistoryTimelineResponse {
    id: string
    orderNumber: string
    status: string
    tableName: string
    areaName: string
    createdAt: string
    pagination: PaginationInfo
    timelineCount: number
    timeline: OrderHistoryTimelineEntry[]
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
            kitchenStatus: filters?.kitchenStatus,
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

export function getOrderHistory(
    orderId: string,
    page = 1,
    limit = 50,
    signal?: AbortSignal,
): Promise<OrderHistoryResponse> {
    return apiFetch(`/api/orders/${orderId}/history`, {
        query: {
            page: Math.max(1, page),
            limit: Math.min(500, Math.max(1, limit)),
        },
        signal,
    })
}

export function getOrderHistoryTimeline(
    orderId: string,
    page = 1,
    limit = 50,
    signal?: AbortSignal,
): Promise<OrderHistoryTimelineResponse> {
    return apiFetch(`/api/orders/${orderId}/history/timeline`, {
        query: {
            page: Math.max(1, page),
            limit: Math.min(500, Math.max(1, limit)),
        },
        signal,
    })
}
