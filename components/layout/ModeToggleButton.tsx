'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { Store } from 'lucide-react'
import { useMode } from '@/components/providers/ModeContext'
import { Button } from '@/components/ui/Button'

export default function ModeToggleButton() {
    const router = useRouter()
    const { toggleMode } = useMode()

    const handleToggleMode = () => {
        toggleMode()
        router.push('/pos/tables')
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggleMode}
            title="Cambiar a Modo Negocio"
            aria-label="Cambiar a Modo Negocio"
        >
            <Store />
            <span className="hidden sm:inline">Comercio</span>
        </Button>
    )
}
