import { API_BASE, getHeaders } from '../../http/client'

const API_ADMIN_PAYMENTS = `${API_BASE}/api/admin/payments`

/**
 * Función auxiliar para hacer requests autenticados
 */
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    const url = `${API_ADMIN_PAYMENTS}${endpoint}`

    const response = await fetch(url, {
        ...options,
        headers: getHeaders(options.headers as Record<string, string>),
        credentials: 'include',
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `API Error: ${response.statusText}`)
    }

    // Manejar respuestas vacías (como en DELETE 204 No Content)
    if (response.status === 204 || !response.headers.get('content-length') || response.headers.get('content-type')?.includes('application/json') === false) {
        return undefined as any as T
    }

    const text = await response.text()
    if (!text) {
        return undefined as any as T
    }

    return JSON.parse(text)
}

/**
 * DTOs
 */
export interface PaymentMethodDto {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

export interface CreatePaymentMethodDto {
    name: string
    code: string
    description?: string
    isActive?: boolean
}

export interface UpdatePaymentMethodDto {
    name?: string
    code?: string
    description?: string
    isActive?: boolean
}

export interface CashDenominationDto {
    id: string
    value: number
    type: string // COIN o BILL
    quantity: number
    total: number // value * quantity
    isActive: boolean
}

export interface UpdateCashDenominationDto {
    quantity: number
}

/**
 * MÉTODOS DE PAGO
 */

export async function listPaymentMethods(includeInactive?: boolean): Promise<PaymentMethodDto[]> {
    try {
        const query = includeInactive ? '?includeInactive=true' : ''
        return apiRequest<PaymentMethodDto[]>(`/methods${query}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error listando métodos de pago:', error)
        throw error
    }
}

export async function getPaymentMethod(id: string): Promise<PaymentMethodDto> {
    try {
        return apiRequest<PaymentMethodDto>(`/methods/${id}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo método de pago:', error)
        throw error
    }
}

export async function createPaymentMethod(dto: CreatePaymentMethodDto): Promise<PaymentMethodDto> {
    try {
        return apiRequest<PaymentMethodDto>('/methods', {
            method: 'POST',
            body: JSON.stringify(dto),
        })
    } catch (error: any) {
        console.error('Error creando método de pago:', error)
        throw error
    }
}

export async function updatePaymentMethod(
    id: string,
    dto: UpdatePaymentMethodDto,
): Promise<PaymentMethodDto> {
    try {
        return apiRequest<PaymentMethodDto>(`/methods/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        })
    } catch (error: any) {
        console.error('Error actualizando método de pago:', error)
        throw error
    }
}

export async function togglePaymentMethodActive(
    id: string,
    isActive: boolean,
): Promise<PaymentMethodDto> {
    try {
        return apiRequest<PaymentMethodDto>(`/methods/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        })
    } catch (error: any) {
        console.error('Error toggling método de pago:', error)
        throw error
    }
}

export async function deletePaymentMethod(id: string): Promise<void> {
    try {
        await apiRequest<void>(`/methods/${id}`, {
            method: 'DELETE',
        })
    } catch (error: any) {
        console.error('Error eliminando método de pago:', error)
        throw error
    }
}

/**
 * DENOMINACIONES DE EFECTIVO
 */

export async function listCashDenominations(includeInactive?: boolean): Promise<CashDenominationDto[]> {
    try {
        const query = includeInactive ? '?includeInactive=true' : ''
        return apiRequest<CashDenominationDto[]>(`/cash-denominations${query}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error listando denominaciones:', error)
        throw error
    }
}

export async function getCashDenomination(id: string): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>(`/cash-denominations/${id}`, {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo denominación:', error)
        throw error
    }
}

export async function updateCashDenomination(
    id: string,
    dto: UpdateCashDenominationDto,
): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>(`/cash-denominations/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(dto),
        })
    } catch (error: any) {
        console.error('Error actualizando denominación:', error)
        throw error
    }
}

export async function incrementCashDenomination(
    id: string,
    amount: number,
): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>(`/cash-denominations/${id}/increment`, {
            method: 'PATCH',
            body: JSON.stringify({ amount }),
        })
    } catch (error: any) {
        console.error('Error incrementando denominación:', error)
        throw error
    }
}

export async function decrementCashDenomination(
    id: string,
    amount: number,
): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>(`/cash-denominations/${id}/decrement`, {
            method: 'PATCH',
            body: JSON.stringify({ amount }),
        })
    } catch (error: any) {
        console.error('Error decrementando denominación:', error)
        throw error
    }
}

export async function toggleCashDenominationActive(
    id: string,
    isActive: boolean,
): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>(`/cash-denominations/${id}/toggle`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        })
    } catch (error: any) {
        console.error('Error toggling denominación:', error)
        throw error
    }
}

export async function createCashDenomination(
    value: number,
    type: 'COIN' | 'BILL',
): Promise<CashDenominationDto> {
    try {
        return apiRequest<CashDenominationDto>('/cash-denominations', {
            method: 'POST',
            body: JSON.stringify({ value, type }),
        })
    } catch (error: any) {
        console.error('Error creando denominación:', error)
        throw error
    }
}

export async function deleteCashDenomination(id: string): Promise<void> {
    try {
        await apiRequest<void>(`/cash-denominations/${id}`, {
            method: 'DELETE',
        })
    } catch (error: any) {
        console.error('Error eliminando denominación:', error)
        throw error
    }
}

/**
 * REPORTES DE CAJA
 */

export async function getCashSummary(): Promise<any> {
    try {
        return apiRequest<any>('/cash-summary', {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo resumen de caja:', error)
        throw error
    }
}

export async function getCashTotal(): Promise<{ total: number }> {
    try {
        return apiRequest<{ total: number }>('/cash-total', {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo total de caja:', error)
        throw error
    }
}

export async function resetCashDenominations(): Promise<{ message: string }> {
    try {
        return apiRequest<{ message: string }>('/cash-reset', {
            method: 'PATCH',
        })
    } catch (error: any) {
        console.error('Error reseteando caja:', error)
        throw error
    }
}

/**
 * Obtiene estadísticas de ventas del día
 * Agrupa los pagos por método de pago
 */
export async function getDailySalesStats(): Promise<{
    totalSales: number
    cashPayments: number
    transferPayments: number
    cardPayments: number
    transactionCount: number
}> {
    try {
        return apiRequest<{
            totalSales: number
            cashPayments: number
            transferPayments: number
            cardPayments: number
            transactionCount: number
        }>('/daily-sales', {
            method: 'GET',
        })
    } catch (error: any) {
        console.error('Error obteniendo ventas del día:', error)
        // Retornar datos por defecto si falla
        return {
            totalSales: 0,
            cashPayments: 0,
            transferPayments: 0,
            cardPayments: 0,
            transactionCount: 0,
        }
    }
}
