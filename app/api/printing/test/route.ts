import { proxyToBackend } from '@/lib/server/backend-proxy'

export async function POST(request: Request) {
    const body: unknown = await request.json().catch(() => ({}))
    return proxyToBackend({
        method: 'POST',
        path: '/api/printing/test',
        body,
        errorMessage: 'Error al enviar prueba de impresión',
        logLabel: 'POST /api/printing/test',
    })
}
