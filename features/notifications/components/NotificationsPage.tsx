'use client'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BadgePercent, Bell, Megaphone, Send, ShieldAlert, UtensilsCrossed } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    FormField,
    Input,
    Skeleton,
    Switch,
    Textarea,
} from '@/components/ui'
import { NotificationBell } from './NotificationBell'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { getUsers } from '@/features/users/api'
import type { UserRole } from '@/lib/types/enums'
import type { AutomaticType, HistoryItem, NotificationType } from '../api'
import { useHistory, useRules, useSendNotification, useUpdateRule } from '../hooks'

const ROLE_LABELS: Record<string, string> = {
    WAITER: 'Meseros',
    CASHIER: 'Cajeros',
    COOK: 'Cocina',
    MANAGER: 'Gerentes',
    ADMINISTRATOR: 'Administradores',
}
const ROLE_ORDER: UserRole[] = ['WAITER', 'CASHIER', 'COOK', 'MANAGER', 'ADMINISTRATOR']

const TYPE_INFO: Record<NotificationType, { label: string; icon: typeof Bell; description: string }> = {
    ANNOUNCEMENT: { label: 'Aviso', icon: Megaphone, description: 'Mensaje enviado manualmente' },
    PRICE_UPDATE: {
        label: 'Cambio de precio',
        icon: BadgePercent,
        description: 'Se envía cuando cambias el precio de un producto, para que nadie cobre el precio viejo.',
    },
    MENU_UPDATE: {
        label: 'Disponibilidad del menú',
        icon: UtensilsCrossed,
        description: 'Se envía cuando un producto se agota o vuelve a estar disponible.',
    },
    SYSTEM_ALERT: {
        label: 'Alerta del sistema',
        icon: ShieldAlert,
        description: 'Se envía cuando el monitoreo detecta algo crítico: ventas en caída, órdenes olvidadas, demoras en cocina.',
    },
}

function RoleChips({ value, onChange, disabled }: { value: UserRole[]; onChange: (roles: UserRole[]) => void; disabled?: boolean }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {ROLE_ORDER.map((role) => {
                const on = value.includes(role)
                return (
                    <button
                        key={role}
                        type="button"
                        disabled={disabled}
                        aria-pressed={on}
                        onClick={() => onChange(on ? value.filter((item) => item !== role) : [...value, role])}
                        className={cn(
                            'rounded-full border px-3 py-1 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                            on ? 'border-primary bg-primary/10 text-foreground' : 'border-border text-muted-foreground hover:bg-surface-muted',
                        )}
                    >
                        {ROLE_LABELS[role]}
                    </button>
                )
            })}
        </div>
    )
}

function Composer() {
    const send = useSendNotification()
    const [title, setTitle] = useState('')
    const [body, setBody] = useState('')
    const [roles, setRoles] = useState<UserRole[]>(['WAITER'])
    const [userIds, setUserIds] = useState<string[]>([])
    const [search, setSearch] = useState('')

    const users = useQuery({ queryKey: ['notifications', 'users'], queryFn: ({ signal }) => getUsers(1, 100, undefined, signal), staleTime: 60_000 })
    const staff = useMemo(
        () =>
            (users.data?.data ?? [])
                .filter((user) => user.isActive)
                .filter((user) => user.name.toLowerCase().includes(search.toLowerCase())),
        [users.data, search],
    )

    const valid = title.trim().length >= 3 && body.trim().length >= 3 && (roles.length > 0 || userIds.length > 0)

    const submit = () =>
        send.mutate(
            { title: title.trim(), body: body.trim(), roles, userIds },
            {
                onSuccess: () => {
                    setTitle('')
                    setBody('')
                    setUserIds([])
                },
            },
        )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Megaphone className="size-5 text-muted-foreground" aria-hidden="true" />
                    Enviar un aviso
                </CardTitle>
                <p className="text-sm text-muted-foreground">Llega como notificación push al dispositivo y a la campana de cada persona.</p>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-4">
                    <FormField label="Título">
                        <Input value={title} maxLength={80} onChange={(event) => setTitle(event.target.value)} placeholder="Ej.: Reunión de turno" />
                    </FormField>
                    <FormField label="Mensaje" description={`${body.length}/300`}>
                        <Textarea value={body} maxLength={300} rows={3} onChange={(event) => setBody(event.target.value)} placeholder="Ej.: Hoy a las 18:00, antes del servicio." />
                    </FormField>

                    <div>
                        <p className="mb-1.5 text-sm font-medium text-foreground">Para quién</p>
                        <RoleChips value={roles} onChange={setRoles} />
                    </div>

                    <div>
                        <p className="mb-1.5 text-sm font-medium text-foreground">
                            O personas concretas{userIds.length > 0 && <span className="ml-1 text-muted-foreground">({userIds.length})</span>}
                        </p>
                        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre…" aria-label="Buscar persona" />
                        <ul className="mt-2 max-h-40 divide-y divide-border overflow-y-auto rounded-md border border-border text-sm">
                            {users.isLoading ? (
                                <li className="p-3">
                                    <Skeleton className="h-4 w-1/2" />
                                </li>
                            ) : staff.length === 0 ? (
                                <li className="p-3 text-muted-foreground">Sin resultados</li>
                            ) : (
                                staff.map((user) => (
                                    <li key={user.id}>
                                        <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-surface-muted">
                                            <input
                                                type="checkbox"
                                                className="size-3.5 accent-[var(--primary)]"
                                                checked={userIds.includes(user.id)}
                                                onChange={() =>
                                                    setUserIds((current) => (current.includes(user.id) ? current.filter((id) => id !== user.id) : [...current, user.id]))
                                                }
                                            />
                                            <span className="flex-1 truncate text-foreground">{user.name}</span>
                                            <span className="text-xs text-muted-foreground">{ROLE_LABELS[user.role] ?? user.role}</span>
                                        </label>
                                    </li>
                                ))
                            )}
                        </ul>
                    </div>

                    <Button onClick={submit} disabled={!valid || send.isPending}>
                        <Send />
                        {send.isPending ? 'Enviando…' : 'Enviar aviso'}
                    </Button>
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Así lo verá el equipo</p>
                    <div className="rounded-xl border border-border bg-surface-muted p-3">
                        <div className="flex gap-3 rounded-lg bg-surface p-3 shadow-card">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Bell className="size-4" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Maminco · ahora</p>
                                <p className="truncate text-sm font-semibold text-foreground">{title || 'Título del aviso'}</p>
                                <p className="text-xs text-muted-foreground">{body || 'El mensaje aparecerá aquí.'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function Rules() {
    const rules = useRules()
    const update = useUpdateRule()
    const role = useAuth((state) => state.user?.role)
    const canEdit = role === 'ADMINISTRATOR'

    return (
        <Card>
            <CardHeader>
                <CardTitle>Avisos automáticos</CardTitle>
                <p className="text-sm text-muted-foreground">
                    El sistema avisa solo cuando algo importante cambia. Elige qué eventos se envían y a quién.
                    {!canEdit && ' Solo un administrador puede cambiarlos.'}
                </p>
            </CardHeader>
            <CardContent className="space-y-3">
                {rules.isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : (
                    (rules.data ?? []).map((rule) => {
                        const info = TYPE_INFO[rule.type]
                        const Icon = info.icon
                        const save = (next: { enabled?: boolean; audienceRoles?: UserRole[] }) =>
                            update.mutate({ type: rule.type as AutomaticType, enabled: next.enabled ?? rule.enabled, audienceRoles: next.audienceRoles ?? rule.audienceRoles })
                        return (
                            <div key={rule.type} className="rounded-lg border border-border p-4">
                                <div className="flex items-start gap-3">
                                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-primary-ink">
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-foreground">{info.label}</p>
                                        <p className="text-sm text-muted-foreground">{info.description}</p>
                                        <div className={cn('mt-3', !rule.enabled && 'opacity-50')}>
                                            <RoleChips value={rule.audienceRoles} disabled={!canEdit || !rule.enabled} onChange={(roles) => save({ audienceRoles: roles })} />
                                        </div>
                                    </div>
                                    <Switch
                                        checked={rule.enabled}
                                        disabled={!canEdit || update.isPending}
                                        aria-label={`Enviar avisos de ${info.label}`}
                                        onCheckedChange={(enabled) => save({ enabled })}
                                    />
                                </div>
                            </div>
                        )
                    })
                )}
            </CardContent>
        </Card>
    )
}

const historyColumns: ColumnDef<HistoryItem>[] = [
    {
        id: 'createdAt',
        header: 'Cuándo',
        accessorFn: (row) => row.createdAt,
        cell: ({ row }) => (
            <span className="whitespace-nowrap text-muted-foreground">
                {new Date(row.original.createdAt).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}
            </span>
        ),
    },
    {
        id: 'type',
        header: 'Tipo',
        accessorFn: (row) => row.type,
        cell: ({ row }) => <Badge variant={row.original.type === 'SYSTEM_ALERT' ? 'danger' : row.original.type === 'ANNOUNCEMENT' ? 'brand' : 'info'}>{TYPE_INFO[row.original.type].label}</Badge>,
    },
    {
        id: 'message',
        header: 'Mensaje',
        enableSorting: false,
        cell: ({ row }) => (
            <>
                <span className="font-medium text-foreground">{row.original.title}</span>
                <span className="block max-w-md truncate text-xs text-muted-foreground">{row.original.body}</span>
            </>
        ),
    },
    {
        id: 'recipients',
        header: 'Destinatarios',
        accessorFn: (row) => row.recipients,
        meta: { align: 'right' },
        cell: ({ row }) => row.original.recipients,
    },
    {
        id: 'read',
        header: 'Leídas',
        accessorFn: (row) => (row.recipients > 0 ? row.read / row.recipients : 0),
        meta: { align: 'right' },
        cell: ({ row }) => (
            <span className="tabular-nums">
                {row.original.read}/{row.original.recipients}
            </span>
        ),
    },
]

export function NotificationsPage() {
    const history = useHistory()
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Notificaciones</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Avisos push para tu equipo: manuales y automáticos. Cada persona los activa en su dispositivo desde la campana.
                    </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    Tu bandeja <NotificationBell />
                </div>
            </div>

            <Composer />
            <Rules />

            <Card>
                <CardHeader>
                    <CardTitle>Historial</CardTitle>
                </CardHeader>
                <CardContent>
                    {history.isLoading ? (
                        <Skeleton className="h-40 w-full" />
                    ) : (history.data ?? []).length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Aún no se enviaron notificaciones.</p>
                    ) : (
                        <DataTable columns={historyColumns} data={history.data ?? []} getRowId={(row) => row.id} initialSorting={[{ id: 'createdAt', desc: true }]} />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
