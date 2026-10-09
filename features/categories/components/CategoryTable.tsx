'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
import type { CategoryResponse, PaginatedCategoriesResponse } from '../api'

interface CategoryTableProps {
    categories: PaginatedCategoriesResponse
    onEdit: (category: CategoryResponse) => void
    onDelete: (category: CategoryResponse) => void
}

export function CategoryTable({
    categories,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    const columns: ColumnDef<CategoryResponse>[] = [
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
            accessorKey: 'productsCount',
            header: 'Productos',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.productsCount || 0}
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
            data={categories.data}
            getRowId={(category) => category.id}
        />
    )
}
