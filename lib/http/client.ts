export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export class ApiError extends Error {
    readonly status: number
    readonly body: unknown

    constructor(message: string, status: number, body?: unknown) {
        super(message)
        this.name = 'ApiError'
        this.status = status
        this.body = body
    }
}

export type QueryParams = Record<
    string,
    string | number | boolean | null | undefined
>

export interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
    /** JSON body, serialized automatically. */
    body?: unknown
    /** Attach the bearer token (default true). */
    auth?: boolean
    /** Query string params; `undefined`/`null` are omitted. */
    query?: QueryParams
}

export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    try {
        const auth = window.localStorage.getItem('maminco-auth')
        if (!auth) return null
        const parsed = JSON.parse(auth)
        return parsed.state?.token || null
    } catch {
        return null
    }
}

export function getHeaders(additionalHeaders?: Record<string, string>) {
    const token = getAuthToken()
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...additionalHeaders,
    }
    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }
    return headers
}

function buildUrl(path: string, query?: QueryParams): string {
    const url = new URL(path, API_BASE)
    if (query) {
        for (const [key, value] of Object.entries(query)) {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, String(value))
            }
        }
    }
    return url.toString()
}

function handleUnauthorized(): void {
    if (typeof window === 'undefined') return
    try {
        window.localStorage.removeItem('maminco-auth')
        document.cookie = 'token=; path=/; max-age=0'
    } catch {
        // storage unavailable
    }
    if (!window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login'
    }
}

/**
 * Single entrypoint for all HTTP calls to the backend.
 * - Prefixes `API_BASE`
 * - Serializes JSON bodies
 * - Attaches the bearer token
 * - Normalizes errors into `ApiError`
 * - Logs out on 401
 */
export async function apiFetch<T = unknown>(
    path: string,
    options: ApiFetchOptions = {},
): Promise<T> {
    const { body, auth = true, query, headers, ...rest } = options

    const response = await fetch(buildUrl(path, query), {
        ...rest,
        headers: {
            'Content-Type': 'application/json',
            ...(auth ? getHeaders() : {}),
            ...headers,
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (response.status === 401) {
        handleUnauthorized()
        throw new ApiError('Sesión expirada', 401)
    }

    const text = await response.text()
    let data: unknown = null
    if (text) {
        try {
            data = JSON.parse(text)
        } catch {
            data = text
        }
    }

    if (!response.ok) {
        const message =
            (data as { message?: string } | null)?.message ||
            response.statusText ||
            'Error de red'
        throw new ApiError(message, response.status, data)
    }

    return data as T
}
