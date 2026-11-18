'use client'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, Bell, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
    id: number
    variant: ToastVariant
    message: string
    title?: string
    duration: number
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

function notify(variant: ToastVariant, message: string, title?: string): number {
    const id = ++counter
    const duration = variant === 'error' ? 5000 : 3500
    toasts = [...toasts, { id, variant, message, title, duration }]
    publish()
    window.setTimeout(() => dismiss(id), duration)
    return id
}

export const toast = {
    success: (message: string, title?: string) => notify('success', message, title),
    error: (message: string, title?: string) => notify('error', message, title),
    info: (message: string, title?: string) => notify('info', message, title),
    dismiss,
}

const VARIANTS: Record<
    ToastVariant,
    { icon: typeof Check; chip: string; bar: string; title: string }
> = {
    success: {
        icon: Check,
        chip: 'bg-success-fill text-white shadow-sm',
        bar: 'bg-success-fill',
        title: 'Listo',
    },
    error: {
        icon: AlertTriangle,
        chip: 'bg-danger-fill text-white shadow-sm',
        bar: 'bg-danger-fill',
        title: 'No se pudo completar',
    },
    info: {
        icon: Bell,
        chip: 'bg-primary text-primary-foreground shadow-sm',
        bar: 'bg-primary',
        title: 'Aviso',
    },
}

function ToastCard({ item }: { item: ToastItem }) {
    const { icon: Icon, chip, bar, title } = VARIANTS[item.variant]
    return (
        <div
            role={item.variant === 'error' ? 'alert' : 'status'}
            className="toast-enter pointer-events-auto relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border border-border bg-surface py-3.5 pl-4 pr-3 shadow-float"
        >
            <span
                className={cn('flex size-9 shrink-0 items-center justify-center rounded-full', chip)}
                aria-hidden="true"
            >
                <Icon className="size-5" strokeWidth={3} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-foreground">
                    {item.title ?? title}
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">{item.message}</p>
            </div>
            <button
                type="button"
                onClick={() => dismiss(item.id)}
                aria-label="Cerrar notificación"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground"
            >
                <X className="size-4" />
            </button>
            <span
                aria-hidden="true"
                className={cn('toast-progress absolute inset-x-0 bottom-0 h-0.5 origin-left', bar)}
                style={{ animationDuration: `${item.duration}ms` }}
            />
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
        <div className="pointer-events-none fixed inset-x-0 top-6 z-[100] flex flex-col items-center gap-3 px-4 sm:items-end sm:pr-6">
            {items.map((item) => (
                <ToastCard key={item.id} item={item} />
            ))}
        </div>,
        document.body,
    )
}
