'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import AdminGuard from './components/AdminGuard'
import ModeToggleButton from './components/ModeToggleButton'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const token = useAuth((s) => s.token)
  const logout = useAuth((s) => s.logout)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  useEffect(() => {
    console.log('📍 AdminLayout rendered. Token:', !!token, 'User:', user)
  }, [token, user])

  // Cerrar sidebar en mobile cuando se navega
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
    }
    handleRouteChange()
  }, [pathname])

  // Escuchar cambios de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const isActive = (path: string) => pathname === path

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 lg:hidden z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-0 w-64 h-screen bg-slate-900 dark:bg-slate-950 border-r border-slate-800 shadow-lg transition-transform duration-300 ease-in-out z-50 flex flex-col ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Maminco</h1>
                <p className="text-xs text-slate-400 mt-1">Admin Panel</p>
              </div>
              {/* Botón cerrar en mobile */}
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <nav className="mt-8 space-y-2 px-4 flex-1 overflow-y-auto">
            <Link
              href="/dashboard"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/dashboard')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📊 Dashboard
            </Link>
            <Link
              href="/users"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/users')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              👥 Users
            </Link>
            <Link
              href="/areas"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/areas')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🏢 Áreas
            </Link>
            <Link
              href="/tables"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/tables')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🪑 Tables
            </Link>
            <Link
              href="/categories"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/categories')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📂 Categorías
            </Link>
            <Link
              href="/products"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/products')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              🍔 Products
            </Link>
            <Link
              href="/orders"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/orders')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              📋 Órdenes
            </Link>
            <Link
              href="/payments"
              className={`block px-4 py-3 rounded-lg transition-all font-medium ${
                isActive('/payments')
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              💳 Payments
            </Link>
          </nav>

          {/* Bottom section - ahora sin absolute, al final del flex */}
          <div className="p-4 border-t border-slate-800 mt-auto">
            <div className="bg-slate-800 rounded-lg p-4 mb-4">
              <p className="text-xs text-slate-400">Sesión de</p>
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all text-sm"
            >
              🚪 Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={`transition-all duration-300 ease-in-out min-h-screen ${isSidebarOpen ? 'lg:ml-64' : 'lg:ml-64'}`}>
          {/* Top Bar */}
          <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Botón toggle sidebar */}
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <svg className="w-6 h-6 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Panel Administrativo</h1>
              </div>
              <div className="flex items-center gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>

                {/* Toggle Modo */}
                <ModeToggleButton />

                {/* Logout */}
                <button
                  onClick={() => {
                    logout()
                    router.push('/auth/login')
                  }}
                  className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  🚪 Salir
                </button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  )
}
