/**
 * HTTP Client - Helpers compartidos para todas las API calls
 * Responsabilidades:
 * - Gestión de tokens de autenticación
 * - Headers por defecto
 * - Base URL de la API
 */

// URL base del backend NestJS. Configúrala con NEXT_PUBLIC_API_URL en .env.local.
export const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

/**
 * Obtiene el token de autenticación desde localStorage (Zustand persists aquí)
 */
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

/**
 * Crea headers HTTP con autenticación incluida
 */
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
