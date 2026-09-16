'use client'
import create from 'zustand'
import { persist } from 'zustand/middleware'
import { apiLogin } from '@/lib/api/auth/login'
import { parseJwt } from '@/lib/api/auth/client'
import { resetSocket } from '@/lib/utils/socket'

type User = {
  id: string
  email: string
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

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setToken(token) {
        if (!token) {
          set({ token: null, user: null })
          return
        }
        const payload = parseJwt(token)
        const user = payload
          ? { id: payload.sub, email: payload.email, name: payload.name, role: payload.role }
          : null
        set({ token, user })
      },
      async login(email, password) {
        const res = await apiLogin(email, password)
        console.log('✅ Backend response recibida')
        
        const token = res.accessToken || res.token || res.access_token
        if (!token) {
          console.error('❌ No token found in response:', Object.keys(res))
          throw new Error('Token no recibido del servidor')
        }

        console.log('✅ Token extraído:', token.substring(0, 20) + '...')
        
        // Decode token to check payload
        const payload = parseJwt(token)
        if (!payload) {
          console.error('❌ Token inválido o no decodificable')
          throw new Error('Token inválido')
        }

        console.log('✅ Token payload válido:', { email: payload.email, role: payload.role })
        
        // Store token in Zustand (which persists to localStorage automatically)
        get().setToken(token)
        console.log('✅ Token guardado en Zustand + localStorage')
        
        // Set cookie as fallback (may not work but doesn't hurt)
        try {
          const d = new Date()
          d.setDate(d.getDate() + 7)
          document.cookie = `token=${token}; path=/; expires=${d.toUTCString()}`
        } catch (e) {
          // ignore
        }
        
        console.log('✅ Login completado exitosamente')
      },
      logout() {
        set({ token: null, user: null })
        try {
          document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        } catch {}
        try {
          resetSocket()
        } catch {}
      },
    }),
    {
      name: 'maminco-auth',
    },
  ),
)

export default useAuth
