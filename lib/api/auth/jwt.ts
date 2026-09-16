/**
 * Lightweight JWT payload extractor for middleware and server-side checks.
 * This does NOT verify signatures. If you need signature verification, do it
 * server-side against your auth provider or use a shared secret.
 */

function base64UrlDecode(str: string) {
    // base64url -> base64
    str = str.replace(/-/g, '+').replace(/_/g, '/')
    const pad = str.length % 4
    if (pad) str += '='.repeat(4 - pad)

    if (typeof atob === 'function') {
        // browser / edge runtime
        const decoded = atob(str)
        try {
            // decode utf-8
            return decodeURIComponent(
                decoded
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            )
        } catch {
            return decoded
        }
    }

    // fallback (node)
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Buffer = require('buffer').Buffer
    return Buffer.from(str, 'base64').toString('utf8')
}

export async function verifyTokenAndGetRole(token?: string | null): Promise<string | null> {
    if (!token) return null
    try {
        const parts = token.split('.')
        if (parts.length < 2) return null
        const payloadJson = base64UrlDecode(parts[1])
        const payload = JSON.parse(payloadJson)
        // common claim names
        return payload.role || payload.roles || payload['role_name'] || null
    } catch (e) {
        return null
    }
}
