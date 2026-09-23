import { apiFetch } from '@/lib/http/client'

export type CategoryStatus = 'ACTIVE' | 'INACTIVE'

export interface CategoryResponse {
    id: string
    name: string
    description?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    productsCount?: number
}

export interface PaginatedCategoriesResponse {
    data: CategoryResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface CreateCategoryPayload {
    name: string
    description?: string
}

export interface UpdateCategoryPayload {
    name?: string
    description?: string
    isActive?: boolean
}

export function getCategories(
    page: number = 1,
    limit: number = 10,
    search?: string,
    signal?: AbortSignal,
): Promise<PaginatedCategoriesResponse> {
    return apiFetch('/api/categories', {
        query: { page, limit, search },
        signal,
    })
}

export function getCategoryById(
    id: string,
    signal?: AbortSignal,
): Promise<CategoryResponse> {
    return apiFetch(`/api/categories/${id}`, { signal })
}

export function getActiveCategories(signal?: AbortSignal): Promise<CategoryResponse[]> {
    return apiFetch('/api/categories/public/active', { auth: false, signal })
}

export function createCategory(
    payload: CreateCategoryPayload,
): Promise<CategoryResponse> {
    return apiFetch('/api/categories', { method: 'POST', body: payload })
}

export function updateCategory(
    id: string,
    payload: UpdateCategoryPayload,
): Promise<CategoryResponse> {
    return apiFetch(`/api/categories/${id}`, { method: 'PATCH', body: payload })
}

export function deleteCategory(id: string): Promise<CategoryResponse> {
    return apiFetch(`/api/categories/${id}`, { method: 'DELETE' })
}
