import { toast } from '@/components/ToastProvider'
import { API_BASE, getHeaders } from '../../http/client'

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

/**
 * Obtener lista de categorías con paginación
 */
export async function getCategories(
    page: number = 1,
    limit: number = 10,
    search?: string
): Promise<PaginatedCategoriesResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
    })

    const response = await fetch(`${API_BASE}/api/categories?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error al cargar categorías')
    }

    const data = await response.json().catch(() => null)
    if (!data) {
        return { data: [], total: 0, page, limit, totalPages: 0 }
    }
    return data
}

/**
 * Obtener categoría por ID
 */
export async function getCategoryById(id: string): Promise<CategoryResponse> {
    const response = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al obtener categoría')
    }

    return response.json()
}

/**
 * Obtener todas las categorías activas (sin paginación)
 * Útil para dropdowns/selects
 * ENDPOINT PÚBLICO - No requiere autenticación
 */
export async function getActiveCategories(): Promise<CategoryResponse[]> {
    const response = await fetch(`${API_BASE}/api/categories/public/active`, {
        method: 'GET',
        // Sin headers de autenticación - endpoint público
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al cargar categorías activas')
    }

    return response.json()
}

/**
 * Crear nueva categoría
 */
export async function createCategory(
    payload: CreateCategoryPayload
): Promise<CategoryResponse> {
    const response = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear categoría')
    }

    return response.json()
}

/**
 * Actualizar categoría
 */
export async function updateCategory(
    id: string,
    payload: UpdateCategoryPayload
): Promise<CategoryResponse> {
    const response = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar categoría')
    }

    return response.json()
}

/**
 * Desactivar categoría (soft delete)
 */
export async function deleteCategory(id: string): Promise<CategoryResponse> {
    const response = await fetch(`${API_BASE}/api/categories/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al desactivar categoría')
    }

    return response.json()
}
