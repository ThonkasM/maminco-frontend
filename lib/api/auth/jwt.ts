/**
 * Lightweight JWT payload extractor for middleware and server-side checks.
 * This does NOT verify signatures (the backend is the source of truth).
 */

function base64UrlDecode(str: string): string {
    const normalized = str.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4)
    const binary = atob(padded)
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
    return new TextDecoder().decode(bytes)
}

export function getRoleFromToken(token?: string | null): string | null {
    if (!token) return null
    try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const payload = JSON.parse(base64UrlDecode(parts[1])) as { role?: string }
        return payload.role ?? null
    } catch {
        return null
    }
}
