import { apiFetch } from '@/lib/http/client'

export interface CreateProductPayload {
    name: string
    description?: string
    price: number
    categoryId: string
    stockGroupId?: string
    individualStock?: number
    isActive?: boolean
}

export interface UpdateProductPayload {
    name?: string
    description?: string
    price?: number
    categoryId?: string
    stockGroupId?: string
    individualStock?: number
    isAvailable?: boolean
    isActive?: boolean
}

export interface ProductImage {
    thumb: string
    large: string
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
    image?: ProductImage | null
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

export function getProducts(
    page = 1,
    limit = 10,
    search?: string,
    categoryId?: string,
    signal?: AbortSignal,
): Promise<PaginatedProductsResponse> {
    return apiFetch('/api/products', {
        query: { page, limit, search, categoryId },
        signal,
    })
}

export function getProductById(
    id: string,
    signal?: AbortSignal,
): Promise<ProductResponse> {
    return apiFetch(`/api/products/${id}`, { signal })
}

export function getAvailableProducts(
    categoryId?: string,
    search?: string,
    limit: number = 50,
    signal?: AbortSignal,
): Promise<ProductResponse[]> {
    return apiFetch('/api/products/public/available', {
        auth: false,
        query: { categoryId, search, limit },
        signal,
    })
}

export function getProductAvailability(
    id: string,
    signal?: AbortSignal,
): Promise<unknown> {
    return apiFetch(`/api/products/public/${id}/availability`, {
        auth: false,
        signal,
    })
}

export function createProduct(
    payload: CreateProductPayload,
): Promise<ProductResponse> {
    return apiFetch('/api/products', { method: 'POST', body: payload })
}

export function updateProduct(
    id: string,
    payload: UpdateProductPayload,
): Promise<ProductResponse> {
    return apiFetch(`/api/products/${id}`, { method: 'PATCH', body: payload })
}

export function deleteProduct(id: string): Promise<ProductResponse> {
    return apiFetch(`/api/products/${id}`, { method: 'DELETE' })
}

export function uploadProductImage(id: string, file: File): Promise<ProductResponse> {
    const body = new FormData()
    body.append('file', file)
    return apiFetch(`/api/products/${id}/image`, { method: 'POST', body })
}

export function deleteProductImage(id: string): Promise<ProductResponse> {
    return apiFetch(`/api/products/${id}/image`, { method: 'DELETE' })
}
