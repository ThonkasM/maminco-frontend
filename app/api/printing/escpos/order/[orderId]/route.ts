import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await params
    return proxyToBackend({
        method: 'GET',
        path: `/api/printing/orders/${encodeURIComponent(orderId)}/escpos`,
        errorMessage: 'Error al generar el ticket de la orden',
        logLabel: 'GET /api/printing/escpos/order/[orderId]',
    })
}
