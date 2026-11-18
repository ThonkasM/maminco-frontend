import { cookies } from 'next/headers'
import { API_BASE } from '@/lib/http/client'

interface ProxyOptions {
    method: 'GET' | 'POST'
    path: string
    body?: unknown
    errorMessage: string
    logLabel: string
    withDefaultPrinter?: boolean
}

interface PrintersResponse {
    defaultPrinter?: string
    printers?: string[]
}

function authHeaders(token: string): HeadersInit {
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    }
}

async function resolveDefaultPrinter(
    token: string,
): Promise<string | undefined> {
    const response = await fetch(`${API_BASE}/api/printing/printers`, {
        method: 'GET',
        headers: authHeaders(token),
    })
    if (!response.ok) return undefined
    const data = (await response.json()) as PrintersResponse
    return data.defaultPrinter || data.printers?.[0]
}

export async function proxyToBackend(options: ProxyOptions): Promise<Response> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('token')?.value
        if (!token) {
            return Response.json({ error: 'No token found' }, { status: 401 })
        }

        let url = `${API_BASE}${options.path}`
        if (options.withDefaultPrinter) {
            const printer = await resolveDefaultPrinter(token)
            if (printer) url += `?printer=${encodeURIComponent(printer)}`
        }

        const response = await fetch(url, {
            method: options.method,
            headers: authHeaders(token),
            body:
                options.body === undefined
                    ? undefined
                    : JSON.stringify(options.body),
        })

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as {
                message?: string
            }
            return Response.json(
                { error: errorData.message || options.errorMessage },
                { status: response.status },
            )
        }

        return Response.json(await response.json())
    } catch (error) {
        console.error(`Error en ${options.logLabel}:`, error)
        return Response.json(
            { error: 'Error al conectar con el servidor' },
            { status: 500 },
        )
    }
}
