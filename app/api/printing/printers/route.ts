import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function GET() {
    return proxyToBackend({
        method: 'GET',
        path: '/api/printing/printers',
        errorMessage: 'Error al obtener impresoras',
        logLabel: 'GET /api/printing/printers',
    })
}
