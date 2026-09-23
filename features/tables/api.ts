import { apiFetch } from '@/lib/http/client'

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED'

export interface CreateTablePayload {
    number: number
    areaId: string
}

export interface UpdateTablePayload {
    number?: number
    areaId?: string
    isActive?: boolean
}

export interface ChangeTableStatusPayload {
    status: TableStatus
}

export interface TableResponse {
    id: string
    number: number
    status: TableStatus
    isActive: boolean
    createdAt: string
    updatedAt: string
    areaId: string
    areaName?: string
    ordersCount?: number
}

export interface PaginatedTablesResponse {
    data: TableResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface TableFilters {
    number?: number
    areaId?: string
    status?: TableStatus
}

export function getTables(
    page = 1,
    limit = 10,
    filters?: TableFilters,
    signal?: AbortSignal,
): Promise<PaginatedTablesResponse> {
    return apiFetch('/api/tables', {
        query: {
            page,
            limit,
            number: filters?.number,
            areaId: filters?.areaId,
            status: filters?.status,
        },
        signal,
    })
}

export function getTableById(
    id: string,
    signal?: AbortSignal,
): Promise<TableResponse> {
    return apiFetch(`/api/tables/${id}`, { signal })
}

export function getTablesByArea(
    areaId: string,
    signal?: AbortSignal,
): Promise<TableResponse[]> {
    return apiFetch(`/api/tables/area/${areaId}`, { signal })
}

export function createTable(payload: CreateTablePayload): Promise<TableResponse> {
    return apiFetch('/api/tables', { method: 'POST', body: payload })
}

export function updateTable(
    id: string,
    payload: UpdateTablePayload,
): Promise<TableResponse> {
    return apiFetch(`/api/tables/${id}`, { method: 'PATCH', body: payload })
}

export function changeTableStatus(
    id: string,
    payload: ChangeTableStatusPayload,
): Promise<TableResponse> {
    return apiFetch(`/api/tables/${id}/status`, { method: 'PATCH', body: payload })
}

export function deleteTable(id: string): Promise<TableResponse> {
    return apiFetch(`/api/tables/${id}`, { method: 'DELETE' })
}
