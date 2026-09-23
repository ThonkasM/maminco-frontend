'use client'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button, Spinner } from '@/components/ui'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
    const user = useAuth((state) => state.user)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <h1 className="text-2xl font-semibold text-foreground">
                        Acceso denegado
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        No hay una sesión activa.
                    </p>
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

    return <>{children}</>
}
