'use client'
import { useEffect, useState } from 'react'
import { Check, ChefHat, Clock, Play, Undo2 } from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    EmptyState,
    Spinner,
} from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type {
    OrderKitchenStatus,
    OrderResponseDto,
} from '@/features/orders/api'
import {
    useKitchenOrders,
    useUpdateKitchenStatus,
} from '../hooks/useKitchenOrders'
import { useKitchenSocket } from '../hooks/useKitchenSocket'

const COLUMNS: { status: OrderKitchenStatus; label: string; dot: string }[] = [
    { status: 'PENDING', label: 'Pendiente', dot: 'bg-warning' },
    { status: 'PREPARING', label: 'En preparación', dot: 'bg-primary' },
    { status: 'READY', label: 'Listo', dot: 'bg-success' },
]

const NEXT: Partial<
    Record<OrderKitchenStatus, { to: OrderKitchenStatus; label: string }>
> = {
    PENDING: { to: 'PREPARING', label: 'Empezar' },
    PREPARING: { to: 'READY', label: 'Marcar listo' },
}

const PREVIOUS: Partial<
    Record<OrderKitchenStatus, { to: OrderKitchenStatus; label: string }>
> = {
    PREPARING: { to: 'PENDING', label: 'Volver' },
    READY: { to: 'PREPARING', label: 'Volver' },
}

// `null` hasta montar en cliente: evita desajustes de hidratación con la hora.
function useNow() {
    const [now, setNow] = useState<number | null>(null)
    useEffect(() => {
        setNow(Date.now())
        const id = setInterval(() => setNow(Date.now()), 60_000)
        return () => clearInterval(id)
    }, [])
    return now
}

function Elapsed({ since, now }: { since: string; now: number | null }) {
    if (now === null) return <span>—</span>
    const minutes = Math.max(
        0,
        Math.floor((now - new Date(since).getTime()) / 60_000),
    )
    return <span>{minutes} min</span>
}

function OrderCard({
    order,
    now,
    onMove,
    busy,
}: {
    order: OrderResponseDto
    now: number | null
    onMove: (orderId: string, status: OrderKitchenStatus) => void
    busy: boolean
}) {
    const next = NEXT[order.kitchenStatus]
    const previous = PREVIOUS[order.kitchenStatus]
    const notes = order.items.filter((item) => item.notes)

    return (
        <Card className="overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border bg-surface-muted px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-foreground">
                        Mesa {order.tableName}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        {order.serviceType}
                    </span>
                </div>
                <Badge variant="neutral">#{order.orderNumber}</Badge>
            </div>
            <CardContent className="space-y-3 p-4">
                <ul className="space-y-1.5">
                    {order.items.map((item) => (
                        <li
                            key={item.id}
                            className="flex items-start justify-between gap-3 text-sm text-foreground"
                        >
                            <span>
                                <span className="mr-2 font-mono font-semibold text-primary">
                                    {item.quantity}×
                                </span>
                                {item.productName}
                            </span>
                        </li>
                    ))}
                    {order.items.length === 0 && (
                        <li className="text-sm text-muted-foreground">
                            Sin items
                        </li>
                    )}
                </ul>

                {notes.length > 0 && (
                    <ul className="space-y-1">
                        {notes.map((item) => (
                            <li
                                key={item.id}
                                className="rounded-md bg-warning/10 px-2 py-1 text-xs text-warning"
                            >
                                {item.productName}: {item.notes}
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5" />
                    <Elapsed since={order.createdAt} now={now} />
                </div>

                <div className="flex gap-2 pt-1">
                    {previous && (
                        <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            disabled={busy}
                            onClick={() => onMove(order.id, previous.to)}
                        >
                            <Undo2 />
                            {previous.label}
                        </Button>
                    )}
                    {next && (
                        <Button
                            size="sm"
                            className="flex-1"
                            disabled={busy}
                            onClick={() => onMove(order.id, next.to)}
                        >
                            {next.to === 'READY' ? <Check /> : <Play />}
                            {next.label}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export function KitchenPage() {
    const { data: orders, isLoading, isError } = useKitchenOrders()
    const update = useUpdateKitchenStatus()
    const now = useNow()
    useKitchenSocket()

    const handleMove = (orderId: string, status: OrderKitchenStatus) =>
        update.mutate({ orderId, status })

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Spinner />
            </div>
        )
    }

    if (isError || !orders) {
        return (
            <div className="p-6">
                <EmptyState
                    icon={<ChefHat />}
                    title="No se pudieron cargar las órdenes"
                    description="Revisa la conexión con el servidor e inténtalo de nuevo."
                />
            </div>
        )
    }

    return (
        <div className="h-full overflow-auto p-6">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        Cocina
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {orders.length} orden{orders.length === 1 ? '' : 'es'}{' '}
                        abierta{orders.length === 1 ? '' : 's'}
                    </p>
                </div>
                <Badge variant="info">
                    {update.isPending ? 'Actualizando…' : 'En vivo'}
                </Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {COLUMNS.map((column) => {
                    const columnOrders = orders.filter(
                        (order) => order.kitchenStatus === column.status,
                    )
                    return (
                        <section
                            key={column.status}
                            className="flex flex-col gap-3"
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className={cn(
                                        'size-2.5 rounded-full',
                                        column.dot,
                                    )}
                                />
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                                    {column.label}
                                </h2>
                                <span className="ml-auto text-xs text-muted-foreground">
                                    {columnOrders.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {columnOrders.map((order) => (
                                    <OrderCard
                                        key={order.id}
                                        order={order}
                                        now={now}
                                        onMove={handleMove}
                                        busy={update.isPending}
                                    />
                                ))}
                                {columnOrders.length === 0 && (
                                    <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                                        Sin órdenes
                                    </p>
                                )}
                            </div>
                        </section>
                    )
                })}
            </div>
        </div>
    )
}
