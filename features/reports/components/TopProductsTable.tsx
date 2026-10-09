'use client'
import { Package } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { ReportTopProduct } from '../api'

interface TopProductsTableProps {
    products: ReportTopProduct[]
    loading: boolean
    error: string | null
}

export function TopProductsTable({
    products,
    loading,
    error,
}: TopProductsTableProps) {
    const columns: ColumnDef<ReportTopProduct>[] = [
        {
            id: 'rank',
            header: '#',
            enableSorting: false,
            cell: ({ row }) => (
                <span className="text-muted-foreground">{row.index + 1}</span>
            ),
        },
        {
            accessorKey: 'productName',
            header: 'Producto',
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {row.original.productName}
                </span>
            ),
        },
        {
            accessorKey: 'categoryName',
            header: 'Categoría',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.categoryName}
                </span>
            ),
        },
        {
            id: 'quantitySold',
            header: 'Cantidad',
            accessorFn: (row) => Number(row.quantitySold),
            meta: { align: 'right' },
            cell: ({ row }) => (
                <span className="text-foreground">
                    {row.original.quantitySold}
                </span>
            ),
        },
        {
            id: 'unitPrice',
            header: 'Precio unit.',
            accessorFn: (row) => Number(row.unitPrice),
            meta: { align: 'right' },
            cell: ({ row }) => (
                <span className="text-foreground">
                    {formatCurrency(Number(row.original.unitPrice))}
                </span>
            ),
        },
        {
            id: 'totalRevenue',
            header: 'Ingresos',
            accessorFn: (row) => Number(row.totalRevenue),
            meta: { align: 'right' },
            cell: ({ row }) => (
                <span className="font-semibold text-success">
                    {formatCurrency(Number(row.original.totalRevenue))}
                </span>
            ),
        },
    ]

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="size-5 text-muted-foreground" />
                    Productos más vendidos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                        {error}
                    </div>
                ) : loading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={products}
                        getRowId={(product) => product.productId}
                        emptyState={
                            <EmptyState
                                icon={<Package />}
                                title="Sin datos"
                                description="No hay productos vendidos para mostrar."
                            />
                        }
                    />
                )}
            </CardContent>
        </Card>
    )
}
