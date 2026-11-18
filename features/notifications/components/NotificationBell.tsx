'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BadgePercent, Bell, BellOff, BellRing, Check, Megaphone, ShieldAlert, UtensilsCrossed } from 'lucide-react'
import { Button } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils/cn'
import { getErrorMessage } from '@/lib/utils/errors'
import { useAuth } from '@/hooks/useAuth'
import type { InboxItem, NotificationType } from '../api'
import { useInbox, useMarkAllRead, useMarkRead } from '../hooks'
import { currentSubscription, disablePush, enablePush, pushSupport } from '../push'

const ICONS: Record<NotificationType, { icon: typeof Bell; tone: string }> = {
    ANNOUNCEMENT: { icon: Megaphone, tone: 'bg-primary/15 text-primary-ink' },
    PRICE_UPDATE: { icon: BadgePercent, tone: 'bg-warning/15 text-warning' },
    MENU_UPDATE: { icon: UtensilsCrossed, tone: 'bg-success/15 text-success' },
    SYSTEM_ALERT: { icon: ShieldAlert, tone: 'bg-danger/15 text-danger' },
}

function timeAgo(iso: string): string {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
    if (minutes < 1) return 'ahora'
    if (minutes < 60) return `hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `hace ${hours} h`
    return `hace ${Math.floor(hours / 24)} d`
}

interface NotificationBellProps {
    /** Header colors differ between the admin top bar and the dark POS header. */
    tone?: 'light' | 'dark'
}

export function NotificationBell({ tone = 'light' }: NotificationBellProps) {
    const token = useAuth((state) => state.token)
    const role = useAuth((state) => state.user?.role)
    const router = useRouter()
    const inbox = useInbox(Boolean(token))
    const markRead = useMarkRead()
    const markAll = useMarkAllRead()
    const [open, setOpen] = useState(false)
    const [pushOn, setPushOn] = useState(false)
    const [busy, setBusy] = useState(false)
    const [support, setSupport] = useState<ReturnType<typeof pushSupport>>('unsupported')
    const panel = useRef<HTMLDivElement>(null)

    const refreshPush = useCallback(async () => {
        setSupport(pushSupport())
        setPushOn(Boolean(await currentSubscription().catch(() => null)))
    }, [])

    useEffect(() => {
        void refreshPush()
    }, [refreshPush])

    useEffect(() => {
        if (!open) return undefined
        const onDown = (event: MouseEvent) => {
            if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false)
        }
        const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    const unread = inbox.data?.unread ?? 0
    const items = inbox.data?.items ?? []

    const openItem = (item: InboxItem) => {
        if (!item.readAt) markRead.mutate(item.id)
        if (item.url) {
            setOpen(false)
            router.push(item.url)
        }
    }

    const togglePush = async () => {
        setBusy(true)
        try {
            if (pushOn) await disablePush()
            else await enablePush()
            await refreshPush()
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo cambiar el permiso.'), 'Notificaciones push')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div className="relative" ref={panel}>
            <button
                type="button"
                onClick={() => setOpen((value) => !value)}
                aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : 'Notificaciones'}
                aria-expanded={open}
                className={cn(
                    'relative inline-flex size-9 items-center justify-center rounded-md border transition-colors',
                    tone === 'dark'
                        ? 'border-nav-foreground/20 text-nav-foreground hover:bg-nav-foreground/10'
                        : 'border-border bg-surface text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                )}
            >
                {unread > 0 ? <BellRing className="size-4" /> : <Bell className="size-4" />}
                {unread > 0 && (
                    <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-danger-fill px-1 text-[10px] font-bold leading-5 text-white">
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div
                    role="dialog"
                    aria-label="Notificaciones"
                    className="absolute right-0 top-11 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface text-foreground shadow-float"
                >
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <p className="text-sm font-semibold">Notificaciones</p>
                        <Button size="sm" variant="ghost" disabled={unread === 0 || markAll.isPending} onClick={() => markAll.mutate()}>
                            <Check />
                            Marcar leídas
                        </Button>
                    </div>

                    <ul className="max-h-80 divide-y divide-border overflow-y-auto">
                        {items.length === 0 ? (
                            <li className="px-4 py-8 text-center text-sm text-muted-foreground">Sin notificaciones por ahora.</li>
                        ) : (
                            items.map((item) => {
                                const { icon: Icon, tone: iconTone } = ICONS[item.type]
                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => openItem(item)}
                                            className={cn('flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-muted', !item.readAt && 'bg-primary/5')}
                                        >
                                            <span className={cn('mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full', iconTone)}>
                                                <Icon className="size-4" aria-hidden="true" />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center gap-2">
                                                    <span className="truncate text-sm font-medium">{item.title}</span>
                                                    {!item.readAt && <span className="size-2 shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
                                                </span>
                                                <span className="block text-xs text-muted-foreground">{item.body}</span>
                                                <span className="mt-0.5 block text-[11px] text-muted-foreground/80">{timeAgo(item.createdAt)}</span>
                                            </span>
                                        </button>
                                    </li>
                                )
                            })
                        )}
                    </ul>

                    <div className="space-y-2 border-t border-border bg-surface-muted/60 px-4 py-3 text-xs">
                        {support === 'unsupported' ? (
                            <p className="text-muted-foreground">Este navegador no admite notificaciones push.</p>
                        ) : support === 'denied' ? (
                            <p className="flex items-center gap-2 text-muted-foreground">
                                <BellOff className="size-4 shrink-0" />
                                Bloqueaste las notificaciones en el navegador. Actívalas desde el candado de la barra de direcciones.
                            </p>
                        ) : (
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted-foreground">
                                    {pushOn ? 'Recibes avisos en este dispositivo aunque la app esté cerrada.' : 'Activa los avisos en este dispositivo.'}
                                </span>
                                <Button size="sm" variant={pushOn ? 'secondary' : 'primary'} disabled={busy} onClick={() => void togglePush()}>
                                    {pushOn ? 'Desactivar' : 'Activar'}
                                </Button>
                            </div>
                        )}
                        {(role === 'ADMINISTRATOR' || role === 'MANAGER') && (
                            <Link
                                href="/communication/notifications"
                                onClick={() => setOpen(false)}
                                className="inline-block font-medium text-primary-ink hover:underline"
                            >
                                Gestionar notificaciones
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
