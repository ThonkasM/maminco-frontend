'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { useMode } from '@/contexts/ModeContext'

export default function ModeToggleButton() {
    const router = useRouter()
    const { toggleMode } = useMode()

    const handleToggleMode = () => {
        toggleMode()
        router.push('/mesas-negocio')
    }

    return (
        <button
            onClick={handleToggleMode}
            className="px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all border border-orange-200 dark:border-orange-800"
            title="Cambiar a Modo Negocio"
        >
            🏪 Comercio
        </button>
    )
}
