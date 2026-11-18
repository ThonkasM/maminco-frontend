'use client'
import React, { useSyncExternalStore } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Spinner } from '@/components/ui'

interface AdminGuardProps {
    children: React.ReactNode
    /**
     * Roles allowed to see this surface. If omitted, any authenticated user
     * passes. Server-side `@Roles` remains the real security boundary.
     */
    allowedRoles?: string[]
}

const subscribeNoop = () => () => {}

function DeniedMessage({ message }: { message: string }) {
    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="max-w-md text-center">
                <h1 className="text-2xl font-semibold text-foreground">
                    Acceso denegado
                </h1>
                <p className="mt-2 text-muted-foreground">{message}</p>
                <Button
                    className="mt-6"
                    onClick={() => (window.location.href = '/auth/login')}
                >
                    Iniciar sesión
                </Button>
            </div>
        </div>
    )
}

export default function AdminGuard({
    children,
    allowedRoles,
}: AdminGuardProps) {
    const user = useAuth((state) => state.user)
    const mounted = useSyncExternalStore(
        subscribeNoop,
        () => true,
        () => false,
    )

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (!user) {
        return <DeniedMessage message="No hay una sesión activa." />
    }

    if (allowedRoles && !allowedRoles.includes(user.role ?? '')) {
        return (
            <DeniedMessage message="Tu rol no tiene acceso a esta sección." />
        )
    }

    return <>{children}</>
}
