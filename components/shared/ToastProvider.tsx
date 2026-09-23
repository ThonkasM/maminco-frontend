'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
    id: number
    variant: ToastVariant
    message: string
}

let toasts: ToastItem[] = []
const listeners = new Set<(items: ToastItem[]) => void>()
let counter = 0

function publish() {
    listeners.forEach((listener) => listener(toasts))
}

function dismiss(id: number) {
    toasts = toasts.filter((item) => item.id !== id)
    publish()
}

function notify(variant: ToastVariant, message: string): number {
    const id = ++counter
    toasts = [...toasts, { id, variant, message }]
    publish()
    const duration = variant === 'error' ? 5000 : 3500
    window.setTimeout(() => dismiss(id), duration)
    return id
}

export const toast = {
    success: (message: string) => notify('success', message),
    error: (message: string) => notify('error', message),
    info: (message: string) => notify('info', message),
    dismiss,
}

const VARIANTS: Record<
    ToastVariant,
    { icon: typeof CheckCircle2; accent: string; ring: string }
> = {
    success: {
        icon: CheckCircle2,
        accent: 'text-success',
        ring: 'ring-success/25',
    },
    error: {
        icon: AlertCircle,
        accent: 'text-danger',
        ring: 'ring-danger/25',
    },
    info: {
        icon: Info,
        accent: 'text-primary',
        ring: 'ring-primary/25',
    },
}

function ToastCard({ item }: { item: ToastItem }) {
    const { icon: Icon, accent, ring } = VARIANTS[item.variant]
    return (
        <div
            role={item.variant === 'error' ? 'alert' : 'status'}
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg border border-border bg-surface p-4 shadow-float ring-1 ring-inset',
                ring,
            )}
        >
            <Icon className={cn('mt-0.5 size-5 shrink-0', accent)} aria-hidden="true" />
            <p className="flex-1 text-sm text-foreground">{item.message}</p>
            <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
                <X className="size-4" />
            </button>
        </div>
    )
}

export function ToastProvider() {
    const [items, setItems] = useState<ToastItem[]>(toasts)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const listener = (next: ToastItem[]) => setItems([...next])
        listeners.add(listener)
        return () => {
            listeners.delete(listener)
        }
    }, [])

    if (!mounted) return null

    return createPortal(
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex flex-col items-center gap-3 px-4">
            {items.map((item) => (
                <ToastCard key={item.id} item={item} />
            ))}
        </div>,
        document.body,
    )
}
