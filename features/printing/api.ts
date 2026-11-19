export interface PrintResult {
    success: boolean
    message: string
}

async function postPrintJob(path: string): Promise<PrintResult> {
    const response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
        const errorData = (await response
            .json()
            .catch(() => ({ error: 'Error desconocido' }))) as {
            error?: string
        }
        throw new Error(
            errorData.error ||
                `Error ${response.status}: ${response.statusText}`,
        )
    }

    return (await response.json()) as PrintResult
}

export function printOrder(orderId: string): Promise<PrintResult> {
    return postPrintJob(`/api/printing/order/${encodeURIComponent(orderId)}`)
}

export function printPaymentReceipt(orderId: string): Promise<PrintResult> {
    return postPrintJob(
        `/api/printing/payment-receipt/${encodeURIComponent(orderId)}`,
    )
}

interface RenderedTicket extends PrintResult {
    data?: string
}

async function fetchRenderedTicket(path: string): Promise<RenderedTicket> {
    const response = await fetch(path, { headers: { Accept: 'application/json' } })
    if (!response.ok) {
        const errorData = (await response.json().catch(() => ({}))) as { error?: string }
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
    }
    return (await response.json()) as RenderedTicket
}

export function fetchOrderTicket(orderId: string): Promise<RenderedTicket> {
    return fetchRenderedTicket(`/api/printing/escpos/order/${encodeURIComponent(orderId)}`)
}

export function fetchPaymentReceiptTicket(orderId: string): Promise<RenderedTicket> {
    return fetchRenderedTicket(`/api/printing/escpos/payment-receipt/${encodeURIComponent(orderId)}`)
}

export function fetchTestTicket(): Promise<RenderedTicket> {
    return fetchRenderedTicket('/api/printing/escpos/test')
}
