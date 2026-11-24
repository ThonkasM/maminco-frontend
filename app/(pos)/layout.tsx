'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogOut, Settings } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMode } from '@/components/providers/ModeContext'
import AdminGuard from '@/features/auth/components/AdminGuard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { POS_ROLES } from '@/lib/types/enums'


function PosLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const logout = useAuth((s) => s.logout)
    const { toggleMode } = useMode()

    const handleLogout = () => {
        logout()
        router.push('/auth/login')
    }

    const handleToggleMode = () => {
        toggleMode()
        router.push('/dashboard')
    }

    return (
        <AdminGuard allowedRoles={[...POS_ROLES]}>
            <div className="h-dvh bg-background flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-40 shrink-0 border-b-[3px] border-brand-leaf bg-nav text-nav-foreground">
                    <div className="flex items-center justify-between gap-2 px-3 py-3 sm:px-6 sm:py-4">
                        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                            <Image
                                src="/maminco-logo-128.png"
                                alt=""
                                width={32}
                                height={32}
                                className="size-8 shrink-0 rounded-md"
                            />
                            <h1 className="truncate font-display text-lg font-normal uppercase tracking-wide text-nav-foreground sm:text-2xl">
                                Maminco POS
                            </h1>
                            <Badge variant="brand" className="hidden border-brand-yellow/40 bg-brand-yellow/15 text-brand-yellow md:inline-flex">Modo POS</Badge>
                        </div>

                        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                            <div className="text-sm text-nav-foreground/70 hidden sm:block text-right">
                                <p className="font-medium text-nav-foreground">{user?.name}</p>
                                <p className="text-xs">{user?.role}</p>
                            </div>

                            <div className="flex items-center gap-1 border-l border-nav-foreground/20 pl-2 sm:gap-2 sm:pl-3">
                                <NotificationBell tone="dark" />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-nav-foreground/30 text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground"
                                    onClick={handleToggleMode}
                                    title="Cambiar a Modo Administrador"
                                    aria-label="Cambiar a Modo Administrador"
                                >
                                    <Settings />
                                    <span className="hidden sm:inline">Admin</span>
                                </Button>

                                <ThemeToggle className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground focus-visible:ring-offset-nav" />

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
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-hidden">
                    {children}
                </main>
            </div>
        </AdminGuard>
    )
}

export default function PosLayout({ children }: { children: React.ReactNode }) {
    return <PosLayoutContent>{children}</PosLayoutContent>
}
