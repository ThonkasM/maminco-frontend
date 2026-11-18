'use client'
import { CheckSquare, FolderInput, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui'

interface SelectionBarProps {
    count: number
    total: number
    busy: boolean
    onClear: () => void
    onSelectAll: () => void
    onMove: () => void
    onDelete: () => void
    /** Lets the upload panel sit above the bar on small screens. */
    className?: string
}

/** Sticky bar with the bulk actions for the current selection. */
export function SelectionBar({ count, total, busy, onClear, onSelectAll, onMove, onDelete }: SelectionBarProps) {
    return (
        <div role="toolbar" aria-label="Acciones de la selección" className="sticky bottom-4 z-30 mx-auto flex w-fit max-w-full flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 shadow-float">
            <span className="px-2 text-sm font-semibold text-foreground" aria-live="polite">
                {count} seleccionado{count === 1 ? '' : 's'}
            </span>
            <Button size="sm" variant="ghost" onClick={onSelectAll} disabled={busy || count === total}>
                <CheckSquare />
                Todo
            </Button>
            <Button size="sm" variant="secondary" onClick={onMove} disabled={busy || count === 0}>
                <FolderInput />
                Mover
            </Button>
            <Button size="sm" variant="danger" onClick={onDelete} disabled={busy || count === 0}>
                <Trash2 />
                Eliminar
            </Button>
            <Button size="sm" variant="ghost" onClick={onClear} disabled={busy} aria-label="Cancelar selección">
                <X />
            </Button>
        </div>
    )
}
