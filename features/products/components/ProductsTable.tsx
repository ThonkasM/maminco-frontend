'use client'

import { Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
import { ProductImage } from '@/components/shared/ProductImage'
import { formatCurrency } from '@/lib/utils/currency'
import type { PaginatedProductsResponse, ProductResponse } from '../api'

interface ProductsTableProps {
    products: PaginatedProductsResponse
    onEdit: (product: ProductResponse) => void
    onDelete: (product: ProductResponse) => void
    getCategoryName: (categoryId: string) => string
}

export function ProductsTable({
    products,
    onEdit,
    onDelete,
    getCategoryName,
}: ProductsTableProps) {
    const columns: ColumnDef<ProductResponse>[] = [
        {
            id: 'image',
            header: '',
            enableSorting: false,
            cell: ({ row }) => <ProductImage image={row.original.image} alt={row.original.name} size={40} />,
        },
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
            id: 'category',
            header: 'Categoría',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {getCategoryName(row.original.categoryId)}
                </span>
            ),
        },
        {
            id: 'price',
            header: 'Precio',
            accessorFn: (row) => Number(row.price),
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {formatCurrency(Number(row.original.price))}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Estado',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'success' : 'danger'}>
                    {row.original.isActive ? 'Activo' : 'Inactivo'}
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
            data={products.data}
            getRowId={(product) => product.id}
        />
    )
}
