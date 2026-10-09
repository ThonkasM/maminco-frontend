'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Armchair,
  BarChart3,
  Brain,
  Building2,
  ChefHat,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Search,
  Settings,
  Tags,
  ToggleRight,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter, usePathname } from 'next/navigation'
import AdminGuard from '@/features/auth/components/AdminGuard'
import ModeToggleButton from '@/components/layout/ModeToggleButton'
import { useFeatureFlag } from '@/features/flags/hooks/useFlags'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { cn } from '@/lib/utils/cn'

const ADMIN_ROLES = ['ADMINISTRATOR', 'MANAGER', 'CASHIER', 'WAITER']

const NAV_GROUPS = [
  {
    label: 'Operación',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/tables', label: 'Mesas', icon: Armchair },
      { href: '/orders', label: 'Órdenes', icon: ClipboardList },
      { href: '/kitchen', label: 'Cocina', icon: ChefHat },
    ],
  },
  {
    label: 'Catálogo',
    items: [
      { href: '/areas', label: 'Áreas', icon: Building2 },
      { href: '/categories', label: 'Categorías', icon: Tags },
      { href: '/products', label: 'Productos', icon: Package },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { href: '/reports', label: 'Reportes', icon: BarChart3 },
      { href: '/ai', label: 'IA', icon: Brain },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/users', label: 'Usuarios', icon: Users },
      { href: '/payments', label: 'Pagos', icon: CreditCard },
      { href: '/features', label: 'Features', icon: ToggleRight },
      { href: '/settings', label: 'Configuración', icon: Settings },
    ],
  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const { enabled: digitalKitchen } = useFeatureFlag('digital_kitchen')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [commandOpen, setCommandOpen] = useState(false)
  // Computed on the client only to avoid SSR/locale hydration mismatches.
  const [today, setToday] = useState('')

  // Collapsible nav groups: everything starts collapsed except the group that
  // contains the active route.
  const activeGroup = NAV_GROUPS.find((group) =>
    group.items.some((item) => item.href === pathname),
  )
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () => (activeGroup ? { [activeGroup.label]: true } : {}),
  )

  useEffect(() => {
    if (!activeGroup) return
    setExpandedGroups((prev) =>
      prev[activeGroup.label] ? prev : { ...prev, [activeGroup.label]: true },
    )
  }, [activeGroup])

  const toggleGroup = (label: string) =>
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }))

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )
  }, [])

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

  const commandItems = NAV_GROUPS.flatMap((group) =>
    group.items
      .filter((item) => item.href !== '/kitchen' || digitalKitchen)
      .map((item) => ({
        href: item.href,
        label: item.label,
        group: group.label,
        icon: item.icon,
      })),
  )

  return (
    <AdminGuard allowedRoles={ADMIN_ROLES}>
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

          <nav className="mt-4 space-y-2 px-4 flex-1 overflow-y-auto">
            {NAV_GROUPS.map((group) => {
              const isOpen = Boolean(expandedGroups[group.label])
              return (
                <div key={group.label}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors hover:text-white/80"
                  >
                    {group.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {isOpen && (
                    <div className="mt-1 space-y-1">
                      {group.items
                        .filter(
                          (item) =>
                            item.href !== '/kitchen' || digitalKitchen,
                        )
                        .map(({ href, label, icon: Icon }) => {
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
                    </div>
                  )}
                </div>
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
                  {today}
                </p>

                <button
                  type="button"
                  onClick={() => setCommandOpen(true)}
                  aria-label="Buscar (Ctrl+K)"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
                >
                  <Search className="size-4" />
                  <span className="hidden sm:inline">Buscar…</span>
                  <kbd className="hidden rounded border border-border bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
                    ⌘K
                  </kbd>
                </button>

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

        <CommandPalette
          items={commandItems}
          open={commandOpen}
          onOpenChange={setCommandOpen}
          onLogout={handleLogout}
        />
      </div>
    </AdminGuard>
  )
}
