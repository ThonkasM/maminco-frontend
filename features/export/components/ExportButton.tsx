'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui'
import type { ExportDefinition } from '../model'
import { ExportDialog } from './ExportDialog'

interface ExportButtonProps {
    build: () => ExportDefinition | null
    disabled?: boolean
    label?: string
    variant?: 'primary' | 'secondary' | 'ghost'
    size?: 'sm' | 'md'
}

/** Opens the report builder with a fresh snapshot of the screen's data. */
export function ExportButton({ build, disabled, label = 'Exportar', variant = 'secondary', size }: ExportButtonProps) {
    const [open, setOpen] = useState(false)
    const [definition, setDefinition] = useState<ExportDefinition | null>(null)
    const [session, setSession] = useState(0)

    return (
        <>
            <Button
                variant={variant}
                size={size}
                disabled={disabled}
                onClick={() => {
                    const next = build()
                    if (!next) return
                    setDefinition(next)
                    setSession((value) => value + 1)
                    setOpen(true)
                }}
            >
                <Download />
                {label}
            </Button>
            {definition && (
                <ExportDialog key={session} definition={definition} open={open} onOpenChange={setOpen} />
            )}
        </>
    )
}
