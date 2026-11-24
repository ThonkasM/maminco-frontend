'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Armchair,
  BarChart3,
  Bell,
  Brain,
  ScrollText,
  Sparkles,
  Building2,
  ChefHat,
  ChevronDown,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Package,
  Search,
  Settings,
  Tags,
  FolderOpen,
  ToggleRight,
  UtensilsCrossed,
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
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { DayClosureGate } from '@/features/closures/components/DayClosureGate'
import { CommandPalette } from '@/components/shared/CommandPalette'
import { cn } from '@/lib/utils/cn'
import { ADMIN_ROLES } from '@/lib/types/enums'


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
      { href: '/insights', label: 'Insights', icon: Sparkles },
      { href: '/ai', label: 'IA', icon: Brain },
      { href: '/audit', label: 'Auditoría', icon: ScrollText },
    ],
  },
  {
    label: 'Comunicación',
    items: [
      { href: '/communication/notifications', label: 'Notificaciones', icon: Bell },
      { href: '/communication/menu', label: 'Menú', icon: UtensilsCrossed },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { href: '/users', label: 'Usuarios', icon: Users },
      { href: '/payments', label: 'Pagos', icon: CreditCard },
      { href: '/repository', label: 'Repositorio', icon: FolderOpen },
      { href: '/features', label: 'Features', icon: ToggleRight },
      { href: '/settings', label: 'Configuración', icon: Settings },
    ],
  },
]

/** Pages only managers and administrators may open (the middleware enforces it too). */
const MANAGER_ONLY_HREFS = ['/audit']

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuth((s) => s.user)
  const logout = useAuth((s) => s.logout)
  const { enabled: digitalKitchen } = useFeatureFlag('digital_kitchen')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [commandOpen, setCommandOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(true)
  const rail = collapsed && isDesktop
  // Computed on the client only to avoid SSR/locale hydration mismatches.
  const [today, setToday] = useState('')
  const [todayShort, setTodayShort] = useState('')

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

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('maminco-sidebar') === 'collapsed')
    } catch {
      /* storage unavailable */
    }
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => setIsDesktop(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const toggleSidebar = () => {
    if (!isDesktop) {
      setIsSidebarOpen((open) => !open)
      return
    }
    setCollapsed((current) => {
      const next = !current
      try {
        localStorage.setItem('maminco-sidebar', next ? 'collapsed' : 'expanded')
      } catch {
        /* storage unavailable */
      }
      return next
    })
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

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
    setTodayShort(
      new Date().toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' }).replace('.', ''),
    )
  }, [])

  useEffect(() => {
    const handleRouteChange = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false)
      }
    }
    handleRouteChange()
  }, [pathname])

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
  const canSee = (href: string) =>
    !MANAGER_ONLY_HREFS.includes(href) || user?.role === 'ADMINISTRATOR' || user?.role === 'MANAGER'

  const commandItems = NAV_GROUPS.flatMap((group) =>
    group.items
      .filter((item) => (item.href !== '/kitchen' || digitalKitchen) && canSee(item.href))
      .map((item) => ({
        href: item.href,
        label: item.label,
        group: group.label,
        icon: item.icon,
      })),
  )

  return (
    <AdminGuard allowedRoles={[...ADMIN_ROLES]}>
      <div className="min-h-screen bg-background">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-brand-charcoal/60 lg:hidden z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            'fixed left-0 top-0 h-screen bg-nav border-r-[3px] border-brand-leaf shadow-lg transition-[transform,width] duration-300 ease-in-out z-50 flex flex-col overflow-x-hidden',
            rail ? 'w-[4.5rem]' : 'w-64',
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          )}
        >
          <div className={cn('p-6', rail && 'px-0 py-6')}>
            <div className={cn('flex items-center justify-between', rail && 'justify-center')}>
              <div className="flex items-center gap-3">
                <Image
                  src="/maminco-logo-128.png"
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-lg"
                />
                {!rail && (
                  <div>
                    <h1>
                      <Image src="/maminco-wordmark.png" alt="Maminco" width={608} height={160} className="h-8 w-auto" />
                    </h1>
                    <p className="text-xs text-white/50 mt-1">Panel Administrativo</p>
                  </div>
                )}
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

          <nav className={cn('scroll-thin mt-4 space-y-2 px-4 flex-1 overflow-y-auto overflow-x-hidden', rail && 'px-3')}>
            {NAV_GROUPS.map((group) => {
              const isOpen = Boolean(expandedGroups[group.label])
              return (
                <div key={group.label} className={cn(rail && 'border-t border-white/10 pt-2 first:border-0 first:pt-0')}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.label)}
                    aria-expanded={isOpen}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white/50 transition-colors hover:text-white/80',
                      rail && 'hidden',
                    )}
                  >
                    {group.label}
                    <ChevronDown
                      className={cn(
                        'h-3.5 w-3.5 transition-transform',
                        isOpen && 'rotate-180',
                      )}
                    />
                  </button>
                  {(isOpen || rail) && (
                    <div className="mt-1 space-y-1">
                      {group.items
                        .filter(
                          (item) =>
                            (item.href !== '/kitchen' || digitalKitchen) && canSee(item.href),
                        )
                        .map(({ href, label, icon: Icon }) => {
                        const active = isActive(href)
                        return (
                          <Link
                            key={href}
                            href={href}
                            aria-current={active ? 'page' : undefined}
                            title={rail ? label : undefined}
                            aria-label={rail ? label : undefined}
                            className={cn(
                              'flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors font-medium text-sm',
                              rail && 'justify-center px-0',
                              active
                                ? 'bg-menu-green text-white'
                                : 'text-white/70 hover:bg-white/10 hover:text-white',
                            )}
                          >
                            <Icon className={cn('shrink-0', rail ? 'size-5' : 'w-4 h-4')} />
                            {!rail && label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          <div className={cn('p-4 border-t border-white/10 mt-auto', rail && 'px-3')}>
            <button
              type="button"
              onClick={toggleSidebar}
              title={rail ? 'Expandir menú (Ctrl+B)' : 'Contraer menú (Ctrl+B)'}
              aria-label={rail ? 'Expandir menú lateral' : 'Contraer menú lateral'}
              className={cn(
                'mb-3 hidden w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white lg:flex',
                rail && 'justify-center px-0',
              )}
            >
              {rail ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-4" />}
              {!rail && 'Contraer menú'}
            </button>
            <div className={cn('bg-white/5 rounded-md p-4 mb-4', rail && 'hidden')}>
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
              title={rail ? 'Cerrar sesión' : undefined}
              aria-label={rail ? 'Cerrar sesión' : undefined}
            >
              <LogOut />
              {!rail && 'Cerrar sesión'}
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={cn(
            'transition-[margin] duration-300 ease-in-out min-h-screen',
            rail ? 'lg:ml-[4.5rem]' : 'lg:ml-64',
          )}
        >
          {/* Top Bar */}
          <div className="bg-surface border-b border-border p-3 sm:p-6 sticky top-0 z-10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={toggleSidebar}
                  className="inline-flex items-center justify-center w-10 h-10 rounded-md hover:bg-surface-muted transition-colors"
                  aria-label={
                    isDesktop ? (collapsed ? 'Expandir menú lateral' : 'Contraer menú lateral') : 'Abrir menú'
                  }
                  title={isDesktop ? `${collapsed ? 'Expandir' : 'Contraer'} menú (Ctrl+B)` : undefined}
                  aria-expanded={isDesktop ? !collapsed : isSidebarOpen}
                >
                  {isDesktop ? (
                    collapsed ? (
                      <PanelLeftOpen className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <PanelLeftClose className="w-5 h-5 text-muted-foreground" />
                    )
                  ) : (
                    <Menu className="w-6 h-6 text-muted-foreground" />
                  )}
                </button>
                <h1 className="hidden whitespace-nowrap font-display text-2xl font-normal uppercase tracking-wide text-foreground sm:block">
                  <span className="2xl:hidden">Panel admin</span>
                  <span className="hidden 2xl:inline">Panel Administrativo</span>
                </h1>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-3">
                <p className="hidden whitespace-nowrap text-sm text-muted-foreground sm:block">
                  <span className="2xl:hidden">{todayShort}</span>
                  <span className="hidden 2xl:inline">{today}</span>
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

                <NotificationBell />
                <ModeToggleButton />
                <ThemeToggle />

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-danger hover:bg-danger/10 hover:text-danger"
                  onClick={handleLogout}
                  aria-label="Salir"
                >
                  <LogOut />
                  <span className="hidden sm:inline">Salir</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Page Content */}
          <div className="p-6">{children}</div>
        </main>

        <DayClosureGate />

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
