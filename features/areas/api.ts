import { apiFetch } from '@/lib/http/client'

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

export function getAreas(
    page = 1,
    limit = 10,
    search?: string,
    signal?: AbortSignal,
): Promise<PaginatedAreasResponse> {
    return apiFetch('/api/areas', {
        query: { page, limit, search },
        signal,
    })
}

export function getAreaById(id: string, signal?: AbortSignal): Promise<AreaResponse> {
    return apiFetch(`/api/areas/${id}`, { signal })
}

export function getActiveAreas(signal?: AbortSignal): Promise<AreaResponse[]> {
    return apiFetch('/api/areas/public/active', { auth: false, signal })
}

export function createArea(payload: CreateAreaPayload): Promise<AreaResponse> {
    return apiFetch('/api/areas', { method: 'POST', body: payload })
}

export function updateArea(id: string, payload: UpdateAreaPayload): Promise<AreaResponse> {
    return apiFetch(`/api/areas/${id}`, { method: 'PATCH', body: payload })
}

export function deleteArea(id: string): Promise<AreaResponse> {
    return apiFetch(`/api/areas/${id}`, { method: 'DELETE' })
}
