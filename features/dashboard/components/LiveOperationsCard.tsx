'use client'
import Link from 'next/link'
import { ArrowRight, Radio } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Card, CardContent, CardHeader, CardTitle, DataTable, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { cn } from '@/lib/utils/cn'
import { STALE_ORDER_MINUTES, useLiveOperations, type LiveOrder } from '../hooks/useLiveOperations'

function formatAge(minutes: number): string {
    if (minutes < 60) return `${minutes} min`
    if (minutes < 60 * 24) return `${Math.floor(minutes / 60)} h ${minutes % 60} min`
    return `${Math.floor(minutes / (60 * 24))} d`
}

const KITCHEN_LABEL = { PENDING: 'En espera', PREPARING: 'Preparando', READY: 'Listo' } as const
const KITCHEN_TONE = { PENDING: 'warning', PREPARING: 'info', READY: 'success' } as const

const columns: ColumnDef<LiveOrder>[] = [
    {
        accessorKey: 'tableName',
        header: 'Mesa',
        cell: ({ row }) => <span className="font-medium text-foreground">{row.original.tableName}</span>,
    },
    {
        id: 'minutesOpen',
        header: 'Abierta',
        accessorFn: (row) => row.minutesOpen,
        cell: ({ row }) => (
            <span className={cn('tabular-nums', row.original.minutesOpen >= STALE_ORDER_MINUTES && 'font-semibold text-danger')}>
                {formatAge(row.original.minutesOpen)}
            </span>
        ),
    },
    {
        id: 'kitchen',
        header: 'Cocina',
        accessorFn: (row) => row.kitchenStatus,
        cell: ({ row }) => (
            <Badge variant={KITCHEN_TONE[row.original.kitchenStatus]}>{KITCHEN_LABEL[row.original.kitchenStatus]}</Badge>
        ),
    },
    {
        id: 'total',
        header: 'Consumo',
        accessorFn: (row) => row.total,
        meta: { align: 'right' },
        cell: ({ row }) => formatCurrency(row.original.total),
    },
]

export function LiveOperationsCard() {
    const live = useLiveOperations()
    const data = live.data

    return (
        <Card className="h-full">
            <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                    <Radio className="size-5 text-success" aria-hidden="true" />
                    Operación en vivo
                </CardTitle>
                <Link href="/tables" className="inline-flex items-center gap-1 text-xs font-medium text-primary-ink hover:underline">
                    Ver mesas <ArrowRight className="size-3" />
                </Link>
            </CardHeader>
            <CardContent className="space-y-4">
                {live.isLoading || !data ? (
                    <Skeleton className="h-64 w-full" />
                ) : (
                    <>
                        <div>
                            <div className="mb-1 flex items-baseline justify-between text-sm">
                                <span className="text-muted-foreground">Ocupación del salón</span>
                                <span className="font-semibold text-foreground">
                                    {data.tables.occupied}/{data.tables.total} mesas · {Math.round(data.tables.occupancy)} %
                                </span>
                            </div>
                            <div className="flex h-2.5 overflow-hidden rounded-full bg-surface-muted" role="img" aria-label={`${Math.round(data.tables.occupancy)} % de mesas ocupadas`}>
                                <div className="bg-primary transition-all" style={{ width: `${data.tables.occupancy}%` }} />
                                <div
                                    className="bg-warning transition-all"
                                    style={{ width: `${data.tables.total ? (data.tables.reserved / data.tables.total) * 100 : 0}%` }}
                                />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                                {data.tables.available} libres · {data.tables.reserved} reservadas
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="rounded-lg bg-surface-muted p-2">
                                <p className="text-lg font-bold text-foreground">{data.openOrders.length}</p>
                                <p className="text-[11px] text-muted-foreground">órdenes abiertas</p>
                            </div>
                            <div className="rounded-lg bg-surface-muted p-2">
                                <p className="text-lg font-bold text-foreground">{formatCurrency(data.openTotal, false)}</p>
                                <p className="text-[11px] text-muted-foreground">por cobrar</p>
                            </div>
                            <div className={cn('rounded-lg p-2', data.stale > 0 ? 'bg-danger/15' : 'bg-surface-muted')}>
                                <p className={cn('text-lg font-bold', data.stale > 0 ? 'text-danger' : 'text-foreground')}>{data.stale}</p>
                                <p className="text-[11px] text-muted-foreground">+{STALE_ORDER_MINUTES} min abiertas</p>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            Cocina: {data.kitchen.pending} en espera · {data.kitchen.preparing} preparando · {data.kitchen.ready} listas
                        </p>

                        {data.openOrders.length > 0 ? (
                            <DataTable columns={columns} data={data.openOrders.slice(0, 5)} getRowId={(row) => row.id} enableSorting={false} />
                        ) : (
                            <p className="py-3 text-center text-sm text-muted-foreground">No hay órdenes abiertas ahora.</p>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
