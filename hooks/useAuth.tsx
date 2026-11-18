'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiLogin, parseJwt } from '@/features/auth/api'
import { resetSocket } from '@/lib/realtime/socket'
import { clearAuthCookie, setAuthCookie } from '@/lib/auth/cookie'
import { decodeJwt, isTokenExpired } from '@/lib/auth/jwt'

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
                setAuthCookie(token)
            },
            logout() {
                set({ token: null, user: null })
                clearAuthCookie()
                resetSocket()
            },
        }),
        {
            name: 'maminco-auth',
            partialize: (state) => ({ token: state.token, user: state.user }),
            onRehydrateStorage: () => (state) => {
                if (!state?.token) return
                if (isTokenExpired(decodeJwt(state.token))) {
                    state.setToken(null)
                    clearAuthCookie()
                    return
                }
                setAuthCookie(state.token)
            },
        },
    ),
)

export default useAuth
