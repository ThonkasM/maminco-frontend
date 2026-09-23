'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Armchair,
  Building2,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Tags,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import AdminGuard from './components/AdminGuard'
import ModeToggleButton from './components/ModeToggleButton'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils/cn'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/users', label: 'Usuarios', icon: Users },
  { href: '/areas', label: 'Áreas', icon: Building2 },
  { href: '/tables', label: 'Mesas', icon: Armchair },
  { href: '/categories', label: 'Categorías', icon: Tags },
  { href: '/products', label: 'Productos', icon: Package },
  { href: '/orders', label: 'Órdenes', icon: ClipboardList },
  { href: '/payments', label: 'Pagos', icon: CreditCard },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

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
      <div className="min-h-screen bg-background">
        {/* Overlay para mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-brand-charcoal/60 lg:hidden z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 w-64 h-screen bg-brand-charcoal border-r border-white/10 shadow-lg transition-transform duration-300 ease-in-out z-50 flex flex-col',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Image
                  src="/maminco-logo.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg"
                />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-white">
                    Maminco
                  </h1>
                  <p className="text-xs text-white/50 mt-1">Panel Administrativo</p>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden text-white/60 hover:text-white transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          <nav className="mt-4 space-y-1 px-4 flex-1 overflow-y-auto">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-white/70 hover:bg-white/10 hover:text-white',
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-white/10 mt-auto">
            <div className="bg-white/5 rounded-md p-4 mb-4">
              <p className="text-xs text-white/50">Sesión de</p>
              <p className="text-sm font-semibold text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut />
              Cerrar sesión
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="transition-all duration-300 ease-in-out min-h-screen lg:ml-64">
          {/* Top Bar */}
          <div className="bg-surface border-b border-border p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-surface-muted transition-colors"
                  aria-label="Abrir menú"
                >
                  <Menu className="w-6 h-6 text-muted-foreground" />
                </button>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                  Panel Administrativo
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground hidden sm:block">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>

                <ModeToggleButton />
                <ThemeToggle />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                  onClick={handleLogout}
                >
                  <LogOut />
                  Salir
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">{children}</div>
        </main>
      </div>
    </AdminGuard>
  )
}
