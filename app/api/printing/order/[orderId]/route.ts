import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function POST(
    _request: Request,
    { params }: { params: Promise<{ orderId: string }> },
) {
    const { orderId } = await params
    return proxyToBackend({
        method: 'POST',
        path: `/api/printing/orders/${encodeURIComponent(orderId)}`,
        withDefaultPrinter: true,
        errorMessage: 'Error al imprimir orden',
        logLabel: 'POST /api/printing/order/[orderId]',
    })
}
