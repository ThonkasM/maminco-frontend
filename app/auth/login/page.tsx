'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import useAuth from '@/hooks/useAuth'

export default function LoginPage() {
  const router = useRouter()
  const login = useAuth((s) => s.login)
  const logout = useAuth((s) => s.logout)
  const token = useAuth((s) => s.token)
  const redirectedRef = useRef(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  // Si ya hay sesión activa, redirige al dashboard (solo una vez)
  useEffect(() => {
    if (token && !redirectedRef.current && !loading) {
      console.log('✅ Token encontrado, redirigiendo a /dashboard')
      redirectedRef.current = true
      router.push('/dashboard')
    }
  }, [token, loading, router])

  // Validación en tiempo real de email
  useEffect(() => {
    if (!email) {
      setEmailError('')
      return
    }
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setEmailError(isValid ? '' : 'Email inválido')
  }, [email])

  // Validación en tiempo real de contraseña
  useEffect(() => {
    if (!password) {
      setPasswordError('')
      return
    }
    setPasswordError(password.length < 6 ? 'Mínimo 6 caracteres' : '')
  }, [password])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Form submitted')
    setError(null)
    setSuccess(false)

    // Validar antes de enviar
    if (emailError || passwordError || !email || !password) {
      setError('Por favor completa los campos correctamente')
      console.error('❌ Validation failed:', { emailError, passwordError, email, password })
      return
    }

    setLoading(true)
    try {
      console.log('🔐 Attempting login with:', email)
      await login(email, password)
      console.log('✅ Login exitoso')
      setSuccess(true)
      
      // Redirigir al dashboard
      console.log('🚀 Redirigiendo a /dashboard')
      router.push('/dashboard')
    } catch (err: any) {
      console.error('❌ Error en login:', err)
      setError(err?.message || 'Error al iniciar sesión. Verifica tus credenciales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-2">Maminco</h1>
          <p className="text-slate-400">Sistema de gestión de restaurante</p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Iniciar sesión</h2>

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">✓ Autenticación exitosa. Redirigiendo...</p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none
                  ${emailError
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
                    : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                  } dark:bg-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {emailError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{emailError}</p>}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-all focus:outline-none
                  ${passwordError
                    ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/10'
                    : 'border-slate-200 dark:border-slate-600 focus:border-blue-500'
                  } dark:bg-slate-700 dark:text-white placeholder-slate-400 dark:placeholder-slate-500`}
              />
              {passwordError && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{passwordError}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success || !!emailError || !!passwordError}
              className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 text-white flex items-center justify-center gap-2
                ${loading || success
                  ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 active:scale-95'
                }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Demo Info */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center mb-4">
              💡 Usa tus credenciales de restaurante para acceder al panel
            </p>
            {token && (
              <button
                type="button"
                onClick={() => {
                  console.log('🗑️ Clearing session')
                  logout()
                  setEmail('')
                  setPassword('')
                }}
                className="w-full text-xs py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                🗑️ Limpiar sesión anterior
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
