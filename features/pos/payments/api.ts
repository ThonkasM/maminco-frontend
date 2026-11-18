import { apiFetch } from '@/lib/http/client'


export interface PaymentMethodResponseDto {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
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

    orderId?: string
    orderNumber?: string
    paymentId?: string
    amountReceived?: number
    amountApplied?: number
    changeAmount?: number | null
    tipAmount?: number
    totalDue?: number
    paymentMethod?: string

    orderStatus?: 'CLOSED' | 'DRAFT' | 'CANCELLED'

    totalPaidSoFar?: number // Total pagado hasta ahora (incluyendo este pago)
    pendingBalance?: number // Saldo pendiente después de este pago
    isPaid?: boolean // true si la orden está completamente pagada

    difference?: number

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

export function getPaymentMethods(
    signal?: AbortSignal,
): Promise<PaymentMethodResponseDto[]> {
    return apiFetch('/api/payments/methods', { signal })
}

export function processPayment(
    orderId: string,
    dto: ProcessPaymentDto,
): Promise<PaymentProcessResponseDto> {
    return apiFetch(`/api/payments/orders/${orderId}`, {
        method: 'POST',
        body: dto,
    })
}

export function getPaymentsByOrder(
    orderId: string,
    signal?: AbortSignal,
): Promise<PaymentResponseDto[]> {
    return apiFetch(`/api/payments/orders/${orderId}`, { signal })
}
