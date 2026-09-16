'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user)
  const token = useAuth((s) => s.token)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('🔐 AdminGuard: Checking auth. Token:', !!token, 'User:', user?.email)
    setMounted(true)
  }, [token, user])

  // Mientras se carga, muestra un loading
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, muestra error
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acceso Denegado</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">No hay sesión activa</p>
          <a href="/auth/login" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
            Iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  // Si todo está bien, renderiza los hijos
  return <>{children}</>
}
