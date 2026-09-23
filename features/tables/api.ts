import { API_BASE, getHeaders } from '@/lib/http/client'

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

export async function getTables(
    page = 1,
    limit = 10,
    filters?: {
        number?: number
        areaId?: string
        status?: TableStatus
    }
): Promise<PaginatedTablesResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (filters?.number !== undefined) params.append('number', String(filters.number))
    if (filters?.areaId) params.append('areaId', filters.areaId)
    if (filters?.status) params.append('status', filters.status)

    const res = await fetch(`${API_BASE}/api/tables?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching tables')
    }

    const data = await res.json().catch(() => null)
    if (!data) {
        return { data: [], total: 0, page, limit, totalPages: 0 }
    }
    return data
}

export async function getTableById(id: string): Promise<TableResponse> {
    const res = await fetch(`${API_BASE}/api/tables/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching table')
    }

    return res.json()
}

export async function getTablesByArea(areaId: string): Promise<TableResponse[]> {
    const res = await fetch(`${API_BASE}/api/tables/area/${areaId}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching tables by area')
    }

    return res.json()
}

export async function createTable(payload: CreateTablePayload): Promise<TableResponse> {
    const res = await fetch(`${API_BASE}/api/tables`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error creating table')
    }

    return res.json()
}

export async function updateTable(id: string, payload: UpdateTablePayload): Promise<TableResponse> {
    const res = await fetch(`${API_BASE}/api/tables/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error updating table')
    }

    return res.json()
}

export async function changeTableStatus(id: string, payload: ChangeTableStatusPayload): Promise<TableResponse> {
    const res = await fetch(`${API_BASE}/api/tables/${id}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error changing table status')
    }

    return res.json()
}

export async function deleteTable(id: string): Promise<TableResponse> {
    const res = await fetch(`${API_BASE}/api/tables/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error deleting table')
    }

    return res.json()
}
