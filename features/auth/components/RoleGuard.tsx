'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { UserRole } from '@/lib/utils/types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
  fallback?: React.ReactNode
}

export default function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
  const router = useRouter()
  const user = useAuth((s) => s.user)
  const token = useAuth((s) => s.token)

  useEffect(() => {
    if (!token || !user) {
      console.log('❌ No token or user, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (!allowedRoles.includes(user.role as UserRole)) {
      console.log(`❌ User role ${user.role} not allowed. Required: ${allowedRoles.join(', ')}`)
      router.push('/unauthorized')
      return
    }

    console.log(`✅ User ${user.email} (${user.role}) has access`)
  }, [token, user, allowedRoles, router])

  // Loading state
  if (!token || !user) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Verificando acceso...</p>
          </div>
        </div>
      )
    )
  }

  // Check roles
  if (!allowedRoles.includes(user.role as UserRole)) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Acceso Denegado</h1>
            <p className="text-slate-600 dark:text-slate-400 mb-4">Tu rol no tiene permisos para acceder aquí.</p>
            <a href="/dashboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
              Volver
            </a>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
