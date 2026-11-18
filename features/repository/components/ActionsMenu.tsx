'use client'
import { useEffect, useRef, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface MenuAction {
    id: string
    label: string
    icon?: React.ReactNode
    danger?: boolean
    onSelect: () => void
}

interface ActionsMenuProps {
    label: string
    actions: MenuAction[]
}

/** Small keyboard-accessible menu: Enter/Space/ArrowDown open it, arrows move, Esc closes. */
export function ActionsMenu({ label, actions }: ActionsMenuProps) {
    const [open, setOpen] = useState(false)
    const [active, setActive] = useState(0)
    const root = useRef<HTMLDivElement>(null)
    const trigger = useRef<HTMLButtonElement>(null)
    const items = useRef<(HTMLButtonElement | null)[]>([])

    useEffect(() => {
        if (!open) return undefined
        const onDown = (event: MouseEvent) => {
            if (root.current && !root.current.contains(event.target as Node)) setOpen(false)
        }
        document.addEventListener('mousedown', onDown)
        return () => document.removeEventListener('mousedown', onDown)
    }, [open])

    useEffect(() => {
        if (open) items.current[active]?.focus()
    }, [open, active])

    const close = () => {
        setOpen(false)
        trigger.current?.focus()
    }

    const onMenuKey = (event: React.KeyboardEvent) => {
        if (event.key === 'Escape') {
            event.preventDefault()
            close()
        } else if (event.key === 'ArrowDown') {
            event.preventDefault()
            setActive((current) => (current + 1) % actions.length)
        } else if (event.key === 'ArrowUp') {
            event.preventDefault()
            setActive((current) => (current - 1 + actions.length) % actions.length)
        } else if (event.key === 'Home') {
            event.preventDefault()
            setActive(0)
        } else if (event.key === 'End') {
            event.preventDefault()
            setActive(actions.length - 1)
        } else if (event.key === 'Tab') {
            setOpen(false)
        }
    }

    if (actions.length === 0) return null

    return (
        <div ref={root} className="relative" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
            <button
                ref={trigger}
                type="button"
                aria-label={`Acciones de ${label}`}
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={() => {
                    setActive(0)
                    setOpen((value) => !value)
                }}
                onKeyDown={(event) => {
                    if (event.key === 'ArrowDown') {
                        event.preventDefault()
                        setActive(0)
                        setOpen(true)
                    }
                }}
                className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
                <MoreVertical className="size-4" />
            </button>
            {open && (
                <div role="menu" aria-label={`Acciones de ${label}`} onKeyDown={onMenuKey} className="absolute right-0 top-10 z-30 w-48 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-float">
                    {actions.map((action, index) => (
                        <button
                            key={action.id}
                            ref={(node) => {
                                items.current[index] = node
                            }}
                            type="button"
                            role="menuitem"
                            tabIndex={index === active ? 0 : -1}
                            onClick={() => {
                                setOpen(false)
                                action.onSelect()
                            }}
                            className={cn(
                                'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none',
                                action.danger ? 'text-danger' : 'text-foreground',
                            )}
                        >
                            {action.icon && <span className="[&_svg]:size-4">{action.icon}</span>}
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
