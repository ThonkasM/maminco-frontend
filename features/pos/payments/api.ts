import { apiFetch } from '@/lib/http/client'

/**
 * DTOs para el flujo de pagos
 */

export interface PaymentMethodResponseDto {
    id: string
    name: string
    description?: string
    isActive: boolean
}

export interface ProcessPaymentDto {
    paymentMethodId: string
    amountReceived: number
    isExtraTip?: boolean
    notes?: string
    cardLastDigits?: string // Para referencia en auditoría (solo tarjeta)
}

export interface PaymentProcessResponseDto {
    status: 'PENDING_CONFIRMATION' | 'COMPLETED' | 'ERROR' | 'PARTIAL_PAYMENT'
    message: string

    // Datos del pago (si fue completado o está pendiente)
    orderId?: string
    orderNumber?: string
    paymentId?: string
    amountReceived?: number
    amountApplied?: number
    changeAmount?: number | null
    tipAmount?: number
    totalDue?: number
    paymentMethod?: string

    // Estado de la orden después del pago
    orderStatus?: 'CLOSED' | 'DRAFT' | 'CANCELLED'

    // Para múltiples pagos parciales
    totalPaidSoFar?: number // Total pagado hasta ahora (incluyendo este pago)
    pendingBalance?: number // Saldo pendiente después de este pago
    isPaid?: boolean // true si la orden está completamente pagada

    // Para confirmación de propina
    difference?: number

    // Para errores
    error?: string
}

export interface PaymentResponseDto {
    id: string
    orderId: string
    orderNumber: string
    amountReceived: number
    amountApplied: number
    changeAmount: number | null
    tipAmount: number
    paymentMethod: {
        id: string
        name: string
    }
    createdBy: {
        id: string
        name: string
        email: string
    }
    createdAt: Date
}

/**
 * Obtiene todos los métodos de pago disponibles
 */
export function getPaymentMethods(
    signal?: AbortSignal,
): Promise<PaymentMethodResponseDto[]> {
    return apiFetch('/api/payments/methods', { signal })
}

/**
 * Procesa un pago en una orden
 *
 * @param orderId - ID de la orden a pagar
 * @param dto - Datos del pago
 * @returns Información del pago procesado
 */
export function processPayment(
    orderId: string,
    dto: ProcessPaymentDto,
): Promise<PaymentProcessResponseDto> {
    return apiFetch(`/api/payments/orders/${orderId}`, {
        method: 'POST',
        body: dto,
    })
}

/**
 * Obtiene todos los pagos de una orden
 */
export function getPaymentsByOrder(
    orderId: string,
    signal?: AbortSignal,
): Promise<PaymentResponseDto[]> {
    return apiFetch(`/api/payments/orders/${orderId}`, { signal })
}
