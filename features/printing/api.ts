import { apiFetch } from '@/lib/http/client'

export interface PrintResult {
    success: boolean
    message: string
}

export interface RenderedTicket extends PrintResult {
    data?: string
}

export function printOrder(orderId: string): Promise<PrintResult> {
    return apiFetch<PrintResult>(`/api/printing/orders/${encodeURIComponent(orderId)}`, { method: 'POST' })
}

export function printPaymentReceipt(orderId: string): Promise<PrintResult> {
    return apiFetch<PrintResult>(`/api/printing/orders/${encodeURIComponent(orderId)}/payment-receipt`, {
        method: 'POST',
    })
}

export function fetchOrderTicket(orderId: string): Promise<RenderedTicket> {
    return apiFetch<RenderedTicket>(`/api/printing/orders/${encodeURIComponent(orderId)}/escpos`)
}

export function fetchPaymentReceiptTicket(orderId: string): Promise<RenderedTicket> {
    return apiFetch<RenderedTicket>(`/api/printing/orders/${encodeURIComponent(orderId)}/payment-receipt/escpos`)
}

export function fetchTestTicket(): Promise<RenderedTicket> {
    return apiFetch<RenderedTicket>('/api/printing/test/escpos')
}
