'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiLogin, parseJwt } from '@/features/auth/api'
import { resetSocket } from '@/lib/realtime/socket'

export type User = {
    id: string
    email: string
    name?: string
    role?: string
}

type JwtClaims = {
    sub?: string
    email?: string
    name?: string
    role?: string
}

type AuthState = {
    token: string | null
    user: User | null
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    setToken: (token: string | null) => void
}

function userFromToken(token: string): User | null {
    const payload = parseJwt(token) as JwtClaims | null
    if (!payload?.sub) return null
    return {
        id: payload.sub,
        email: payload.email ?? '',
        name: payload.name,
        role: payload.role,
    }
}

export const useAuth = create<AuthState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken(token) {
                if (!token) {
                    set({ token: null, user: null })
                    return
                }
                set({ token, user: userFromToken(token) })
            },
            async login(email, password) {
                const res = await apiLogin(email, password)
                const token = res.accessToken || res.token || res.access_token
                if (!token) {
                    throw new Error('Token no recibido del servidor')
                }
                if (!parseJwt(token)) {
                    throw new Error('Token inválido')
                }
                set({ token, user: userFromToken(token) })
                try {
                    const expires = new Date()
                    expires.setDate(expires.getDate() + 7)
                    document.cookie = `token=${token}; path=/; expires=${expires.toUTCString()}`
                } catch {
                    // cookie no disponible
                }
            },
            logout() {
                set({ token: null, user: null })
                try {
                    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
                } catch {
                    // ignore
                }
                resetSocket()
            },
        }),
        {
            name: 'maminco-auth',
        },
    ),
)

export default useAuth
