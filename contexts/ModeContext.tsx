'use client'
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

export type Mode = 'admin' | 'pos'

interface ModeContextType {
    mode: Mode
    setMode: (mode: Mode) => void
    toggleMode: () => void
}

const ModeContext = createContext<ModeContextType | undefined>(undefined)

export function ModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setModeState] = useState<Mode>('admin')

    useEffect(() => {
        try {
            const saved = localStorage.getItem('maminco-mode')
            if (saved === "pos" || saved === 'admin') {
                setModeState(saved)
            }
        } catch {
            // localStorage no disponible (SSR)
        }
    }, [])

    const value = useMemo<ModeContextType>(() => {
        const setMode = (newMode: Mode) => {
            setModeState(newMode)
            try {
                localStorage.setItem('maminco-mode', newMode)
            } catch {
                // localStorage no disponible
            }
        }

        return {
            mode,
            setMode,
            toggleMode: () => setMode(mode === 'admin' ? "pos" : 'admin'),
        }
    }, [mode])

    return <ModeContext.Provider value={value}>{children}</ModeContext.Provider>
}

export function useMode() {
    const context = useContext(ModeContext)
    if (!context) {
        throw new Error('useMode debe estar dentro de ModeProvider')
    }
    return context
}
