import { isUserRole, type UserRole } from '@/lib/types/enums'

export interface JwtClaims {
    sub?: string
    email?: string
    name?: string
    role?: string
    exp?: number
}

export function decodeJwt(token: string): JwtClaims | null {
    try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
        const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0))
        const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes))
        return parsed && typeof parsed === 'object' ? (parsed as JwtClaims) : null
    } catch {
        return null
    }
}

export function isTokenExpired(claims: JwtClaims | null, nowMs = Date.now()): boolean {
    if (!claims) return true
    if (typeof claims.exp !== 'number') return false
    return claims.exp * 1000 <= nowMs
}

export function roleFromClaims(claims: JwtClaims | null): UserRole | null {
    return isUserRole(claims?.role) ? claims.role : null
}
