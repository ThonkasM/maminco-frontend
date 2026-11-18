'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { CalendarCheck, FileText, TriangleAlert } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, DataTable, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { formatBusinessDate, type ClosureSummary } from '../api'
import { useClosureStatus, useClosures } from '../hooks'
import { RunClosureDialog } from './RunClosureDialog'

export function ClosurePanel() {
    const status = useClosureStatus()
    const closures = useClosures()
    const [target, setTarget] = useState<{ date: string; early: boolean } | null>(null)

    const columns = useMemo<ColumnDef<ClosureSummary>[]>(
        () => [
            {
                id: 'businessDate',
                header: 'Día',
                accessorFn: (row) => row.businessDate,
                cell: ({ row }) => <span className="font-medium capitalize text-foreground">{formatBusinessDate(row.original.businessDate)}</span>,
            },
            {
                id: 'totalSales',
                header: 'Ventas',
                accessorFn: (row) => row.totalSales,
                meta: { align: 'right' },
                cell: ({ row }) => formatCurrency(row.original.totalSales),
            },
            { id: 'totalOrders', header: 'Órdenes', accessorFn: (row) => row.totalOrders, meta: { align: 'right' }, cell: ({ row }) => row.original.totalOrders },
            {
                id: 'type',
                header: 'Tipo',
                enableSorting: false,
                cell: ({ row }) => (
                    <span className="flex flex-wrap gap-1">
                        <Badge variant={row.original.early ? 'warning' : 'success'}>{row.original.early ? 'Anticipado' : 'Normal'}</Badge>
                        {row.original.regeneratedCount > 0 && <Badge variant="neutral">Regenerado ×{row.original.regeneratedCount}</Badge>}
                    </span>
                ),
            },
            {
                id: 'closedAt',
                header: 'Generado',
                accessorFn: (row) => row.closedAt,
                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-muted-foreground">{new Date(row.original.closedAt).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })}</span>
                ),
            },
            {
                id: 'pdf',
                header: '',
                enableSorting: false,
                cell: ({ row }) =>
                    row.original.documentId ? (
                        <Link href="/repository" className="inline-flex items-center gap-1 text-sm font-medium text-primary-ink hover:underline">
                            <FileText className="size-4" aria-hidden="true" />
                            Ver en Repositorio
                        </Link>
                    ) : null,
            },
        ],
        [],
    )

    const data = status.data
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="size-5 text-muted-foreground" aria-hidden="true" />
                        Cierre de día
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        El cierre genera un PDF con el resumen de caja del día de negocio y lo guarda en el Repositorio. Es manual: si queda un día sin cerrar, el panel te lo
                        pedirá al ingresar.
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    {status.isLoading || !data ? (
                        <Skeleton className="h-24 w-full" />
                    ) : (
                        <>
                            {data.pending.length > 0 ? (
                                <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
                                    <p className="flex items-center gap-2 font-semibold text-foreground">
                                        <TriangleAlert className="size-4 text-warning" aria-hidden="true" />
                                        {data.pending.length} día{data.pending.length === 1 ? '' : 's'} pendiente{data.pending.length === 1 ? '' : 's'} de cierre
                                    </p>
                                    <ul className="mt-3 space-y-2">
                                        {data.pending.map((date) => (
                                            <li key={date} className="flex flex-wrap items-center justify-between gap-2">
                                                <span className="capitalize text-foreground">{formatBusinessDate(date)}</span>
                                                <Button size="sm" onClick={() => setTarget({ date, early: false })}>
                                                    Correr cierre
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="rounded-lg border border-success/30 bg-success/10 p-4 text-sm text-foreground">No hay días pendientes de cierre.</p>
                            )}

                            <div className="rounded-lg border border-border p-4">
                                <p className="font-medium text-foreground">Cerrar el día actual</p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Hoy es <span className="capitalize">{formatBusinessDate(data.currentBusinessDate)}</span> y todavía no termina. Cerrarlo ahora genera un
                                    reporte parcial marcado como «cierre anticipado». Úsalo solo si de verdad terminó la jornada.
                                </p>
                                <Button className="mt-3" variant="secondary" size="sm" onClick={() => setTarget({ date: data.currentBusinessDate, early: true })}>
                                    Cierre anticipado de hoy…
                                </Button>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Cierres generados</CardTitle>
                </CardHeader>
                <CardContent>
                    {closures.isLoading ? (
                        <Skeleton className="h-32 w-full" />
                    ) : (closures.data ?? []).length === 0 ? (
                        <p className="py-6 text-center text-sm text-muted-foreground">Aún no se generó ningún cierre.</p>
                    ) : (
                        <DataTable columns={columns} data={closures.data ?? []} getRowId={(row) => row.id} initialSorting={[{ id: 'businessDate', desc: true }]} />
                    )}
                </CardContent>
            </Card>

            <RunClosureDialog key={target?.date ?? 'none'} date={target?.date ?? null} early={target?.early} onClose={() => setTarget(null)} />
        </div>
    )
}
