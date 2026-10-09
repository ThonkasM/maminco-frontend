'use client'
import React from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChefHat, LogOut } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AdminGuard from '@/features/auth/components/AdminGuard'
import { useFeatureFlag } from '@/features/flags/hooks/useFlags'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

const KITCHEN_ROLES = ['COOK', 'MANAGER', 'ADMINISTRATOR']

function KitchenLayoutContent({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const logout = useAuth((s) => s.logout)
    const { enabled, isLoading } = useFeatureFlag('digital_kitchen')

    const handleLogout = () => {
        logout()
        router.push('/auth/login')
    }

    return (
        <AdminGuard allowedRoles={KITCHEN_ROLES}>
            <div className="flex h-screen flex-col bg-background">
                <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-surface">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Image
                                src="/maminco-logo.png"
                                alt=""
                                width={32}
                                height={32}
                                className="size-8 shrink-0 rounded-md"
                            />
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Maminco Cocina
                            </h1>
                            <Badge variant="brand">Cocina</Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden text-right text-sm text-muted-foreground sm:block">
                                <p className="font-medium text-foreground">
                                    {user?.name}
                                </p>
                                <p className="text-xs">{user?.role}</p>
                            </div>

                            <div className="flex items-center gap-2 border-l border-border pl-3">
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
