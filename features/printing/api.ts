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
