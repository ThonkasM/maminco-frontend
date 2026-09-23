import { API_BASE, getHeaders } from '@/lib/http/client'

const API_ORDERS = `${API_BASE}/api/orders`

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_ORDERS}${endpoint}`
    const response = await fetch(url, {
        ...options,
        headers: getHeaders(options.headers as Record<string, string>),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    if (response.status === 204 || !response.headers.get('content-length')) {
        return {} as T
    }

    return response.json()
}

/**
 * Interfaces para el historial de auditoría
 */
export interface OrderHistoryEntry {
    id: string
    action: string
    description: string
    metadata: any
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
    metadata?: any  // Contiene información adicional según la acción
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

/**
 * Obtiene el historial completo de una orden
 * @param orderId - ID de la orden
 * @param page - Número de página (default: 1)
 * @param limit - Items por página (default: 50, max: 500)
 */
export async function getOrderHistory(
    orderId: string,
    page: number = 1,
    limit: number = 50,
): Promise<OrderHistoryResponse> {
    try {
        const params = new URLSearchParams({
            page: Math.max(1, page).toString(),
            limit: Math.min(500, Math.max(1, limit)).toString(),
        })
        return apiRequest<OrderHistoryResponse>(`/${orderId}/history?${params}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo historial de orden:', error)
        throw error
    }
}

/**
 * Obtiene el timeline visual simplificado de una orden
 * @param orderId - ID de la orden
 * @param page - Número de página (default: 1)
 * @param limit - Items por página (default: 50, max: 500)
 */
export async function getOrderHistoryTimeline(
    orderId: string,
    page: number = 1,
    limit: number = 50,
): Promise<OrderHistoryTimelineResponse> {
    try {
        const params = new URLSearchParams({
            page: Math.max(1, page).toString(),
            limit: Math.min(500, Math.max(1, limit)).toString(),
        })
        return apiRequest<OrderHistoryTimelineResponse>(`/${orderId}/history/timeline?${params}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo timeline de orden:', error)
        throw error
    }
}
