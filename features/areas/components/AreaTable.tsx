'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
import type { AreaResponse, PaginatedAreasResponse } from '../api'

interface AreaTableProps {
    areas: PaginatedAreasResponse
    onEdit: (area: AreaResponse) => void
    onDelete: (area: AreaResponse) => void
}

export function AreaTable({ areas, onEdit, onDelete }: AreaTableProps) {
    const columns: ColumnDef<AreaResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {row.original.name}
                </span>
            ),
        },
        {
            accessorKey: 'description',
            header: 'Descripción',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.description || '—'}
                </span>
            ),
        },
        {
            id: 'type',
            header: 'Tipo',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={row.original.isVirtual ? 'info' : 'neutral'}>
                    {row.original.isVirtual ? 'Virtual' : 'Física'}
                </Badge>
            ),
        },
        {
            accessorKey: 'tablesCount',
            header: 'Mesas',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.tablesCount || 0}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Estado',
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
            data={areas.data}
            getRowId={(area) => area.id}
        />
    )
}
