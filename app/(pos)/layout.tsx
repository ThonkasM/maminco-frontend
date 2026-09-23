'use client'
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useMode } from '@/contexts/ModeContext'
import AdminGuard from '../(admin)/components/AdminGuard'

function NegocioLayoutContent({ children }: { children: React.ReactNode }) {
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
            <div className="h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
                {/* Header */}
                <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40 shrink-0">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                                🏪 Maminco POS
                            </h1>
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 rounded-full text-xs font-semibold">
                                Modo Pos
                            </span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                <p className="font-medium">{user?.name}</p>
                                <p className="text-xs">{user?.role}</p>
                            </div>

                            <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
                                <button
                                    onClick={handleToggleMode}
                                    className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                                    title="Cambiar a Modo Administrador"
                                >
                                    ⚙️ Admin
                                </button>

                                <button
                                    onClick={handleLogout}
                                    className="px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                >
                                    🚪 Salir
                                </button>
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

export default function NegocioLayout({ children }: { children: React.ReactNode }) {
    return <NegocioLayoutContent>{children}</NegocioLayoutContent>
}
