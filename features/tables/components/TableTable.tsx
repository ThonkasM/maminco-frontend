'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
import type { BadgeProps } from '@/components/ui'
import type {
    PaginatedTablesResponse,
    TableResponse,
    TableStatus,
} from '../api'

interface TableTableProps {
    tables: PaginatedTablesResponse
    onEdit: (table: TableResponse) => void
    onDelete: (table: TableResponse) => void
    onStatusChange: (table: TableResponse) => void
}

const statusLabels: Record<TableStatus, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
}

const statusVariants: Record<TableStatus, BadgeProps['variant']> = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
}

export function TableTable({
    tables,
    onEdit,
    onDelete,
    onStatusChange,
}: TableTableProps) {
    const columns: ColumnDef<TableResponse>[] = [
        {
            accessorKey: 'number',
            header: '#',
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    #{row.original.number}
                </span>
            ),
        },
        {
            accessorKey: 'areaName',
            header: 'Área',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.areaName || '—'}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Estado',
            enableSorting: false,
            cell: ({ row }) => (
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0"
                    onClick={() => onStatusChange(row.original)}
                    title="Cambiar estado"
                >
                    <Badge variant={statusVariants[row.original.status]}>
                        {statusLabels[row.original.status]}
                    </Badge>
                </Button>
            ),
        },
        {
            accessorKey: 'ordersCount',
            header: 'Pedidos',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.ordersCount || 0}
                </span>
            ),
        },
        {
            id: 'active',
            header: 'Activa',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'success' : 'danger'}>
                    {row.original.isActive ? 'Activa' : 'Inactiva'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            enableSorting: false,
            meta: { align: 'right' },
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 />
                        Desactivar
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={tables.data}
            getRowId={(table) => table.id}
        />
    )
}
