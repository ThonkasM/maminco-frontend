'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Settings, Store } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useMode } from '@/contexts/ModeContext'
import AdminGuard from '../(admin)/components/AdminGuard'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/theme/ThemeToggle'

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
        <AdminGuard>
            <div className="h-screen bg-background flex flex-col">
                {/* Header */}
                <header className="bg-surface border-b border-border sticky top-0 z-40 shrink-0">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Store className="w-6 h-6 text-primary" />
                            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                                Maminco POS
                            </h1>
                            <Badge variant="brand">Modo POS</Badge>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-sm text-muted-foreground hidden sm:block text-right">
                                <p className="font-medium text-foreground">{user?.name}</p>
                                <p className="text-xs">{user?.role}</p>
                            </div>

                            <div className="flex items-center gap-2 border-l border-border pl-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleToggleMode}
                                    title="Cambiar a Modo Administrador"
                                >
                                    <Settings />
                                    Admin
                                </Button>

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
