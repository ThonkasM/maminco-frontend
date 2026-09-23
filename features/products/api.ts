import { API_BASE, getHeaders } from '@/lib/http/client'

export interface CreateProductPayload {
    name: string
    description?: string
    price: number // Entero, sin decimales
    categoryId: string
    stockGroupId?: string // Opcional
    individualStock?: number // Opcional - se puede registrar después
    isActive?: boolean
}

export interface UpdateProductPayload {
    name?: string
    description?: string
    price?: number // Entero, sin decimales
    categoryId?: string
    stockGroupId?: string
    individualStock?: number
    isAvailable?: boolean
    isActive?: boolean
}

export interface ProductResponse {
    id: string
    name: string
    description?: string
    price: number
    categoryId: string
    categoryName: string
    stockGroupId?: string
    stockGroupName?: string
    individualStock?: number
    isAvailable: boolean
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface PaginatedProductsResponse {
    data: ProductResponse[]
    total: number
    page: number
    limit: number
    totalPages: number
}

/**
 * Obtener lista de productos con paginación (requiere autenticación)
 */
export async function getProducts(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string
): Promise<PaginatedProductsResponse> {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) })
    if (search) params.append('search', search)
    if (categoryId) params.append('categoryId', categoryId)

    const res = await fetch(`${API_BASE}/api/products?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching products')
    }

    const data = await res.json().catch(() => null)
    if (!data) {
        return { data: [], total: 0, page, limit, totalPages: 0 }
    }
    return data
}

/**
 * Obtener producto por ID (requiere autenticación)
 */
export async function getProductById(id: string): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching product')
    }

    return res.json()
}

/**
 * Obtener productos disponibles públicamente (sin autenticación)
 * ENDPOINT PÚBLICO - Ideal para mostrar menú
 */
export async function getAvailableProducts(
    categoryId?: string,
    search?: string,
    limit: number = 50
): Promise<ProductResponse[]> {
    const params = new URLSearchParams()
    if (categoryId) params.append('categoryId', categoryId)
    if (search) params.append('search', search)
    params.append('limit', String(limit))

    const res = await fetch(
        `${API_BASE}/api/products/public/available?${params}`,
        {
            method: 'GET',
            // ENDPOINT PÚBLICO - No requiere autenticación
        }
    )

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching available products')
    }

    return res.json()
}

/**
 * Obtener disponibilidad de stock de un producto (público)
 */
export async function getProductAvailability(id: string): Promise<any> {
    const res = await fetch(
        `${API_BASE}/api/products/public/${id}/availability`,
        {
            method: 'GET',
            // ENDPOINT PÚBLICO - No requiere autenticación
        }
    )

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching product availability')
    }

    return res.json()
}

/**
 * Crear producto (requiere autenticación + ADMINISTRATOR)
 */
export async function createProduct(payload: CreateProductPayload): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error creating product')
    }

    return res.json()
}

/**
 * Actualizar producto (requiere autenticación + ADMINISTRATOR)
 */
export async function updateProduct(
    id: string,
    payload: UpdateProductPayload
): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error updating product')
    }

    return res.json()
}

/**
 * Desactivar/eliminar producto (requiere autenticación + ADMINISTRATOR)
 */
export async function deleteProduct(id: string): Promise<ProductResponse> {
    const res = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error deleting product')
    }

    return res.json()
}
