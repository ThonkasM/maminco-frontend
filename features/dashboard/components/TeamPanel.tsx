'use client'
import { useMemo } from 'react'
import { Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { BreakdownItem } from '@/features/reports/api'

interface TeamPanelProps {
    items: BreakdownItem[]
    loading?: boolean
}

export function TeamPanel({ items, loading }: TeamPanelProps) {
    const total = items.reduce((sum, item) => sum + item.totalSales, 0)
    const columns = useMemo<ColumnDef<BreakdownItem>[]>(
        () => [
            { accessorKey: 'label', header: 'Mesero', cell: ({ row }) => <span className="font-medium text-foreground">{row.original.label}</span> },
            {
                id: 'totalOrders',
                header: 'Órdenes',
                accessorFn: (row) => row.totalOrders,
                meta: { align: 'right' },
                cell: ({ row }) => row.original.totalOrders.toLocaleString('es-BO'),
            },
            {
                id: 'ticket',
                header: 'Ticket',
                accessorFn: (row) => (row.totalOrders > 0 ? row.totalSales / row.totalOrders : 0),
                meta: { align: 'right' },
                cell: ({ getValue }) => formatCurrency(Number(getValue())),
            },
            {
                id: 'totalSales',
                header: 'Ventas',
                accessorFn: (row) => row.totalSales,
                meta: { align: 'right' },
                cell: ({ row }) => <span className="font-medium text-foreground">{formatCurrency(row.original.totalSales)}</span>,
            },
            {
                id: 'share',
                header: '% venta',
                accessorFn: (row) => (total > 0 ? (row.totalSales / total) * 100 : 0),
                meta: { align: 'right' },
                cell: ({ getValue }) => `${Number(getValue()).toLocaleString('es-BO', { maximumFractionDigits: 1 })} %`,
            },
        ],
        [total],
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Users className="size-5 text-muted-foreground" aria-hidden="true" />
                    Rendimiento del equipo
                </CardTitle>
                <p className="text-sm text-muted-foreground">Ventas y ticket promedio por mesero</p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-48 w-full" />
                ) : items.length === 0 ? (
                    <EmptyState icon={<Users />} title="Sin datos" description="No hay órdenes atendidas en este periodo." />
                ) : (
                    <DataTable columns={columns} data={items} getRowId={(row) => row.key} initialSorting={[{ id: 'totalSales', desc: true }]} />
                )}
            </CardContent>
        </Card>
    )
}
