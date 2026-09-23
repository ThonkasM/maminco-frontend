import { apiFetch } from '@/lib/http/client'

export interface AuthUser {
    id: string
    email: string
    name?: string
    role?: string
}

interface LoginResponse {
    accessToken?: string
    token?: string
    access_token?: string
    user?: AuthUser
}

export async function apiLogin(
    email: string,
    password: string,
): Promise<LoginResponse> {
    return apiFetch<LoginResponse>('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: { email, password },
    })
}

export function parseJwt(token: string): Record<string, unknown> | null {
    try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const json = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join(''),
        )
        return JSON.parse(json)
    } catch {
        return null
    }
}

export function getRoleFromToken(token?: string | null): string | null {
    if (!token) return null
    const payload = parseJwt(token)
    return (payload?.role as string) ?? null
}
