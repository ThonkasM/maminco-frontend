'use client'
import { History } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable, EmptyState } from '@/components/ui'
import type { OrderHistoryTimelineEntry } from '../api'
import { OrderActionIcon } from './OrderActionIcon'

interface OrderHistoryTableProps {
    history: OrderHistoryTimelineEntry[]
    isLoading?: boolean
}

export function OrderHistoryTable({
    history,
    isLoading = false,
}: OrderHistoryTableProps) {
    const columns: ColumnDef<OrderHistoryTimelineEntry>[] = [
        {
            id: 'timestamp',
            header: 'Hora',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-muted-foreground">
                    {row.original.timestamp}
                </span>
            ),
        },
        {
            id: 'action',
            header: 'Acción',
            cell: ({ row }) => (
                <span className="flex items-center gap-2 whitespace-nowrap">
                    <OrderActionIcon action={row.original.action} />
                    <span className="font-medium text-foreground">
                        {row.original.action}
                    </span>
                </span>
            ),
        },
        {
            id: 'user',
            header: 'Usuario',
            cell: ({ row }) => (
                <span className="whitespace-nowrap text-muted-foreground">
                    {row.original.user}
                </span>
            ),
        },
        {
            id: 'detail',
            header: 'Descripción',
            cell: ({ row }) => (
                <span
                    className="block max-w-xs truncate text-muted-foreground"
                    title={row.original.detail || row.original.description}
                >
                    {row.original.detail || row.original.description || '—'}
                </span>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={history}
            loading={isLoading}
            enableSorting={false}
            getRowId={(entry) => entry.id || entry.timestamp}
            emptyState={
                <EmptyState
                    icon={<History />}
                    title="Sin historial"
                    description="No hay registros de auditoría para esta orden."
                />
            }
        />
    )
}
