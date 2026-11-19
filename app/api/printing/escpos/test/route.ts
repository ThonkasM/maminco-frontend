import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function GET() {
    return proxyToBackend({
        method: 'GET',
        path: '/api/printing/test/escpos',
        errorMessage: 'Error al generar el ticket de prueba',
        logLabel: 'GET /api/printing/escpos/test',
    })
}
