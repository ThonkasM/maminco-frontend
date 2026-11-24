'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChefHat, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AdminGuard from '@/features/auth/components/AdminGuard'
import { useFeatureFlag } from '@/features/flags/hooks/useFlags'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonVariants } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { KITCHEN_ROLES } from '@/lib/types/enums'


function KitchenLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const logout = useAuth((s) => s.logout)
    const canGoBack = user?.role === 'ADMINISTRATOR' || user?.role === 'MANAGER'
    const { enabled, isLoading } = useFeatureFlag('digital_kitchen')

    const handleLogout = () => {
        logout()
        router.push('/auth/login')
    }

    return (
        <AdminGuard allowedRoles={[...KITCHEN_ROLES]}>
            <div className="flex h-screen flex-col bg-background">
                <header className="sticky top-0 z-40 shrink-0 border-b-[3px] border-brand-leaf bg-nav text-nav-foreground">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            {canGoBack && (
                                <Link
                                    href="/dashboard"
                                    aria-label="Volver al panel"
                                    className={buttonVariants({
                                        variant: 'ghost',
                                        size: 'sm',
                                        className:
                                            'text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground',
                                    })}
                                >
                                    <ArrowLeft />
                                    <span className="hidden sm:inline">Panel</span>
                                </Link>
                            )}
                            <Image
                                src="/maminco-logo-128.png"
                                alt=""
                                width={32}
                                height={32}
                                className="size-8 shrink-0 rounded-md"
                            />
                            <h1 className="truncate font-display text-lg font-normal uppercase tracking-wide text-nav-foreground sm:text-2xl">
                                Maminco Cocina
                            </h1>
                            <Badge variant="brand" className="hidden border-brand-yellow/40 bg-brand-yellow/15 text-brand-yellow md:inline-flex">Cocina</Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden text-right text-sm text-nav-foreground/70 sm:block">
                                <p className="font-medium text-nav-foreground">
                                    {user?.name}
                                </p>
                                <p className="text-xs">{user?.role}</p>
                            </div>

                            <div className="flex items-center gap-2 border-l border-nav-foreground/20 pl-3">
                                <NotificationBell tone="dark" />
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

                <main className="flex-1 overflow-hidden">
                    {isLoading ? (
                        <div className="flex h-full items-center justify-center">
                            <Spinner />
                        </div>
                    ) : enabled ? (
                        children
                    ) : (
                        <div className="p-6">
                            <EmptyState
                                icon={<ChefHat />}
                                title="Cocina Digitalizada no está habilitada"
                                description="Pide a un administrador que active la función “Cocina Digitalizada” en el panel de Features."
                                action={
                                    <Button
                                        variant="secondary"
                                        onClick={handleLogout}
                                    >
                                        Cerrar sesión
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </main>
            </div>
        </AdminGuard>
    )
}

export default function KitchenLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <KitchenLayoutContent>{children}</KitchenLayoutContent>
}
