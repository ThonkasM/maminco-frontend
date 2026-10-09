'use client'
import {
    BarChart3,
    ClipboardList,
    DollarSign,
    Package,
    UtensilsCrossed,
} from 'lucide-react'
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
import type { DailySalesDto, TopProductDto } from '../api'

interface TopProductsTableProps {
    products: TopProductDto[]
    loading?: boolean
}

export function TopProductsTable({
    products,
    loading = false,
}: TopProductsTableProps) {
    const columns: ColumnDef<TopProductDto>[] = [
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
            header: 'Total',
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
                {loading ? (
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

interface SalesSummaryCardProps {
    sales: DailySalesDto
    loading?: boolean
}

export function SalesSummaryCard({
    sales,
    loading = false,
}: SalesSummaryCardProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        )
    }

    const cards = [
        {
            label: 'Total ventas',
            value: formatCurrency(Number(sales.totalSales)),
            icon: DollarSign,
            className: 'text-success',
        },
        {
            label: 'Total órdenes',
            value: sales.totalOrders.toLocaleString(),
            icon: ClipboardList,
            className: 'text-primary',
        },
        {
            label: 'Promedio por orden',
            value: formatCurrency(Number(sales.averageOrderValue)),
            icon: BarChart3,
            className: 'text-accent-foreground',
        },
        {
            label: 'Mesas activas',
            value: sales.mesaOrders.toLocaleString(),
            icon: UtensilsCrossed,
            className: 'text-warning',
        },
    ]

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.label}>
                        <CardContent className="p-4">
                            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-surface-muted">
                                <Icon className={`size-4 ${card.className}`} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {card.label}
                            </p>
                            <p className="mt-1 text-xl font-bold text-foreground">
                                {card.value}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
