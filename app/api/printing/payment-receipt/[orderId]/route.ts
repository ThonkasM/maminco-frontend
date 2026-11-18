import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await params
    return proxyToBackend({
        method: 'POST',
        path: `/api/printing/orders/${encodeURIComponent(orderId)}/payment-receipt`,
        withDefaultPrinter: true,
        errorMessage: 'Error al imprimir recibo',
        logLabel: 'POST /api/printing/payment-receipt/[orderId]',
    })
}
