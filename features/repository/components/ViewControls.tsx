'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ, Check, LayoutGrid, List, Rows3, Grid3X3 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { SortDirection, SortKey, ViewMode } from '../lib'

const MODES: { mode: ViewMode; label: string; icon: typeof List }[] = [
    { mode: 'list', label: 'Lista', icon: List },
    { mode: 'large', label: 'Iconos grandes', icon: LayoutGrid },
    { mode: 'medium', label: 'Iconos medianos', icon: Rows3 },
    { mode: 'small', label: 'Iconos pequeños', icon: Grid3X3 },
]

export function ViewModeSwitch({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
    const refs = useRef<(HTMLButtonElement | null)[]>([])
    const move = (index: number) => {
        const next = (index + MODES.length) % MODES.length
        onChange(MODES[next].mode)
        refs.current[next]?.focus()
    }
    return (
        <div role="radiogroup" aria-label="Vista" className="inline-flex rounded-lg border border-border bg-surface p-1">
            {MODES.map(({ mode: value, label, icon: Icon }, index) => {
                const active = value === mode
                return (
                    <button
                        key={value}
                        ref={(node) => {
                            refs.current[index] = node
                        }}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        aria-label={label}
                        title={label}
                        tabIndex={active ? 0 : -1}
                        onClick={() => onChange(value)}
                        onKeyDown={(event) => {
                            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                                event.preventDefault()
                                move(index + 1)
                            } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                                event.preventDefault()
                                move(index - 1)
                            }
                        }}
                        className={cn(
                            'inline-flex size-9 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                    </button>
                )
            })}
        </div>
    )
}

const SORTS: { key: SortKey; label: string }[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'date', label: 'Fecha' },
    { key: 'size', label: 'Tamaño' },
]

interface SortMenuProps {
    sortKey: SortKey
    direction: SortDirection
    onChange: (key: SortKey, direction: SortDirection) => void
}

export function SortMenu({ sortKey, direction, onChange }: SortMenuProps) {
    const [open, setOpen] = useState(false)
    const root = useRef<HTMLDivElement>(null)
    const Icon = direction === 'asc' ? ArrowUpAZ : ArrowDownAZ

    useEffect(() => {
        if (!open) return undefined
        const onDown = (event: MouseEvent) => {
            if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
        }
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const choose = (key: SortKey) => {
        if (key === sortKey) onChange(key, direction === 'asc' ? 'desc' : 'asc')
        else onChange(key, key === 'name' ? 'asc' : 'desc')
    }

    return (
        <div ref={root} className="relative">
            <Button variant="secondary" size="sm" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
                <Icon />
                Ordenar: {SORTS.find((item) => item.key === sortKey)?.label}
            </Button>
            {open && (
                <div role="menu" aria-label="Ordenar por" className="absolute right-0 top-11 z-30 w-52 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-float">
                    {SORTS.map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            role="menuitemradio"
                            aria-checked={item.key === sortKey}
                            onClick={() => choose(item.key)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none"
                        >
                            <span className="w-4">{item.key === sortKey && <Check className="size-4 text-primary-ink" />}</span>
                            <span className="flex-1">{item.label}</span>
                            {item.key === sortKey && <span className="text-xs text-muted-foreground">{direction === 'asc' ? 'ascendente' : 'descendente'}</span>}
                        </button>
                    ))}
                    <p className="border-t border-border px-3 py-2 text-xs text-muted-foreground">Toca la opción activa para invertir el orden.</p>
                </div>
            )}
        </div>
    )
}
