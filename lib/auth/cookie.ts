import { decodeJwt } from './jwt'

const COOKIE_NAME = 'token'
const FALLBACK_MAX_AGE = 60 * 60 * 24 * 7

export function setAuthCookie(token: string) {
    if (typeof document === 'undefined') return
    const exp = decodeJwt(token)?.exp
    const maxAge = exp
        ? Math.max(0, Math.floor(exp - Date.now() / 1000))
        : FALLBACK_MAX_AGE
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_NAME}=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`
}

export function clearAuthCookie() {
    if (typeof document === 'undefined') return
    const secure = window.location.protocol === 'https:' ? '; Secure' : ''
    document.cookie = `${COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax${secure}`
}
