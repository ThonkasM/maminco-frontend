import { API_BASE, getHeaders } from '@/lib/http/client'

export interface CreateAreaPayload {
    name: string
    description?: string
    isVirtual?: boolean
}

export interface UpdateAreaPayload {
    name?: string
    description?: string
    isVirtual?: boolean
    isActive?: boolean
}

export interface AreaResponse {
    id: string
    name: string
    description?: string
    isVirtual: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
    tablesCount?: number
}

export interface PaginatedAreasResponse {
    data: AreaResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export async function getAreas(page = 1, limit = 10, search?: string): Promise<PaginatedAreasResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)

    const res = await fetch(`${API_BASE}/api/areas?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching areas')
    }

    return res.json()
}

export async function getAreaById(id: string): Promise<AreaResponse> {
    const res = await fetch(`${API_BASE}/api/areas/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching area')
    }

    return res.json()
}

export async function getActiveAreas(): Promise<AreaResponse[]> {
    const res = await fetch(`${API_BASE}/api/areas/public/active`, {
        method: 'GET',
        // ENDPOINT PÚBLICO - No requiere autenticación
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching active areas')
    }

    return res.json()
}

export async function createArea(payload: CreateAreaPayload): Promise<AreaResponse> {
    const res = await fetch(`${API_BASE}/api/areas`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error creating area')
    }

    return res.json()
}

export async function updateArea(id: string, payload: UpdateAreaPayload): Promise<AreaResponse> {
    const res = await fetch(`${API_BASE}/api/areas/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error updating area')
    }

    return res.json()
}

export async function deleteArea(id: string): Promise<AreaResponse> {
    const res = await fetch(`${API_BASE}/api/areas/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error deleting area')
    }

    return res.json()
}
