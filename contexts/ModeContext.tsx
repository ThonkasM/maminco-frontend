'use client'
import React, { createContext, useContext, useEffect, useState } from 'react'

export type Mode = 'admin' | 'negocio'

interface ModeContextType {
    mode: Mode
    setMode: (mode: Mode) => void
    toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<Mode>('admin')
    const [mounted, setMounted] = useState(false)

    // Cargar modo desde localStorage al montar
    useEffect(() => {
        try {
            const saved = localStorage.getItem('maminco-mode')
            if (saved === 'negocio' || saved === 'admin') {
                setModeState(saved)
            }
        } catch {
            // localStorage no disponible
        }
        setMounted(true)
    }, [])

    const setMode = (newMode: Mode) => {
        setModeState(newMode)
        try {
            localStorage.setItem('maminco-mode', newMode)
        } catch {
            // localStorage no disponible
        }
    }

    const toggleMode = () => {
        const newMode = mode === 'admin' ? 'negocio' : 'admin'
        setMode(newMode)
    }

    if (!mounted) {
        return <>{children}</>
    }

    return (
        <ModeContext.Provider value={{ mode, setMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    )
}

export function useMode() {
    const context = useContext(ModeContext)
    if (!context) {
        throw new Error('useMode debe estar dentro de ModeProvider')
    }
    return context
}
