'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

function HomeContent() {
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)

    useEffect(() => {
        // Si no está autenticado, redirige al login
        if (!token) {
            router.push('/auth/login')
            return
        }

        // Si está autenticado, redirige a dashboard (admin es el default)
        if (token && user) {
            router.push('/dashboard')
            return
        }
    }, [token, user, router])

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">⌛</div>
                <p className="text-slate-400">Redirigiendo...</p>
            </div>
        </div>
    )
}

export default function Home() {
    return <HomeContent />
}
