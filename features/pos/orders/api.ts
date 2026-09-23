import { API_BASE, getHeaders } from '@/lib/http/client'

// ============ TYPES ============

export type OrderStatus = 'DRAFT' | 'CLOSED' | 'CANCELLED'
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
    serviceType: ServiceType

    // Montos
    subtotal: number
    discountAmount: number
    tipAmount: number
    total: number

    // Mesa
    tableId: string
    tableName: string
    areaId: string

    // Usuarios
    createdById: string
    createdByName: string
    attendedById?: string
    attendedByName?: string
    closedById?: string
    closedByName?: string

    // Items
    items: OrderItemResponseDto[]
    itemCount: number

    // Timestamps
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

export interface CreateOrderPayload {
    tableId: string
    createdById: string
    attendedById?: string
    initialItems?: Array<{
        productId: string
        quantity: number
        notes?: string
    }>
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

// ============ API FUNCTIONS ============

/**
 * Crear nueva orden
 */
export async function createOrder(
    payload: CreateOrderPayload
): Promise<OrderResponseDto> {
    console.log('🔵 [createOrder] Enviando payload:', payload)
    console.log('🔵 [createOrder] URL:', `${API_BASE}/api/orders`)
    console.log('🔵 [createOrder] Headers:', getHeaders())

    const response = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    console.log('🔵 [createOrder] Response status:', response.status, response.statusText)

    if (!response.ok) {
        let errorBody = ''
        try {
            errorBody = await response.clone().text()
        } catch (e) {
            errorBody = 'Could not read response body'
        }

        console.error('🔴 [createOrder] Error response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorBody || '(empty)',
            contentType: response.headers.get('content-type'),
        })

        let error: any = { message: `HTTP ${response.status}: ${response.statusText}` }
        if (errorBody) {
            try {
                error = JSON.parse(errorBody)
            } catch {
                error.details = errorBody
            }
        }

        throw new Error(error.message || error.error || `Error creating order (${response.status})`)
    }

    return response.json()
}

/**
 * Crear orden si no existe, o retornar la existente
 * Útil para el POS: al entrar a una mesa, crea orden o retorna la activa
 * El serviceType se asigna automáticamente en el backend según table.area.name
 */
export async function createOrderIfNotExists(
    tableId: string,
    userId: string,
): Promise<OrderResponseDto> {
    // Primero intenta obtener la orden activa
    const activeOrder = await getActiveOrderByTable(tableId)
    if (activeOrder) {
        return activeOrder
    }

    // Si no existe, crea una nueva con reintentos automáticos
    let lastError: any = null
    const maxRetries = 3

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`📝 Intento ${attempt}/${maxRetries} de crear orden para mesa ${tableId}`)
            const newOrder = await createOrder({
                tableId,
                createdById: userId,
            })
            console.log(`✅ Orden creada exitosamente en intento ${attempt}:`, newOrder)
            return newOrder
        } catch (err: any) {
            lastError = err
            console.warn(`⚠️ Intento ${attempt} falló:`, err.message)

            // Si es el último intento, lanzar el error
            if (attempt === maxRetries) {
                console.error(`❌ Se agotaron los ${maxRetries} intentos de crear orden`)
                throw err
            }

            // Esperar con backoff exponencial antes de reintentar
            const delayMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000)
            console.log(`⏳ Esperando ${delayMs}ms antes de reintentar...`)
            await new Promise(resolve => setTimeout(resolve, delayMs))
        }
    }

    // Esto nunca debería llegar, pero por seguridad
    throw lastError || new Error('Unknown error creating order')
}

/**
 * Listar órdenes con filtros
 */
export async function getOrders(
    page: number = 1,
    limit: number = 10,
    filters?: {
        status?: OrderStatus
        tableId?: string
        serviceType?: ServiceType
        createdById?: string
        onlyOpen?: boolean
        sortBy?: 'createdAt' | 'total' | 'status'
        sortOrder?: 'asc' | 'desc'
    }
): Promise<PaginatedOrdersResponse> {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    })

    if (filters?.status) params.append('status', filters.status)
    if (filters?.tableId) params.append('tableId', filters.tableId)
    if (filters?.serviceType) params.append('serviceType', filters.serviceType)
    if (filters?.createdById) params.append('createdById', filters.createdById)
    if (filters?.onlyOpen) params.append('onlyOpen', String(filters.onlyOpen))
    if (filters?.sortBy) params.append('sortBy', filters.sortBy)
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await fetch(`${API_BASE}/api/orders?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching orders')
    }

    return response.json()
}

/**
 * Obtener orden por ID
 */
export async function getOrderById(id: string): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${id}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching order')
    }

    return response.json()
}

/**
 * Obtener orden activa (DRAFT) de una mesa
 * Retorna null si no hay orden abierta
 * Útil para el POS: al entrar a una mesa, verificar si ya existe orden
 */
export async function getActiveOrderByTable(tableId: string): Promise<OrderResponseDto | null> {
    const response = await fetch(`${API_BASE}/api/orders/table/${tableId}/active`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (response.status === 404) {
        return null
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching active order')
    }

    const data = await response.json().catch(() => null)
    if (!data) {
        return null
    }
    return data
}

/**
 * Cambiar estado de orden
 */
export async function changeOrderStatus(
    orderId: string,
    payload: ChangeOrderStatusPayload
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error changing order status')
    }

    return response.json()
}

/**
 * Agregar item a orden
 */
export async function addOrderItem(
    orderId: string,
    payload: AddOrderItemPayload
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/items`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error adding item to order')
    }

    return response.json()
}

/**
 * Actualizar cantidad de un item en una orden
 * Preserva el ID del item y actualiza los totales
 */
export async function updateOrderItemQuantity(
    orderId: string,
    itemId: string,
    quantity: number,
    notes?: string
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/items/${itemId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ quantity, notes }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error updating item quantity')
    }

    return response.json()
}

/**
 * Eliminar item de orden
 */
export async function removeOrderItem(
    orderId: string,
    itemId: string
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/items/${itemId}`, {
        method: 'DELETE',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error removing item from order')
    }

    return response.json()
}

/**
 * Aplicar descuento a orden
 */
export async function applyDiscount(
    orderId: string,
    payload: ApplyDiscountPayload
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/discount`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error applying discount')
    }

    return response.json()
}

/**
 * Agregar propina a orden
 */
export async function addTip(
    orderId: string,
    tipAmount: number
): Promise<OrderResponseDto> {
    const response = await fetch(`${API_BASE}/api/orders/${orderId}/tip`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ tipAmount }),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error adding tip')
    }

    return response.json()
}

/**
 * Obtener estadísticas de ingresos
 */
export async function getRevenueStats(): Promise<any> {
    const response = await fetch(`${API_BASE}/api/orders/stats/revenue`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching revenue stats')
    }

    return response.json()
}

/**
 * Obtener órdenes por estado
 */
export async function getOrdersByStatus(): Promise<any> {
    const response = await fetch(`${API_BASE}/api/orders/stats/by-status`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching orders by status')
    }

    return response.json()
}

/**
 * Obtener órdenes por tipo de servicio
 */
export async function getOrdersByServiceType(): Promise<any> {
    const response = await fetch(`${API_BASE}/api/orders/stats/by-service-type`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }))
        throw new Error(error.message || 'Error fetching orders by service type')
    }

    return response.json()
}
