'use client'
import { useMemo } from 'react'
import { Trophy } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Card, CardContent, CardHeader, CardTitle, DataTable, EmptyState, Skeleton } from '@/components/ui'
import { BarListChart } from '@/components/charts'
import { formatCurrency } from '@/lib/utils/currency'
import type { ReportTopProduct } from '@/features/reports/api'

interface TopProductsPanelProps {
    products: ReportTopProduct[]
    totalSales: number
    loading?: boolean
}

export function TopProductsPanel({ products, totalSales, loading }: TopProductsPanelProps) {
    const columns = useMemo<ColumnDef<ReportTopProduct>[]>(
        () => [
            { id: 'rank', header: '#', enableSorting: false, cell: ({ row }) => <span className="text-muted-foreground">{row.index + 1}</span> },
            {
                accessorKey: 'productName',
                header: 'Producto',
                cell: ({ row }) => (
                    <>
                        <span className="font-medium text-foreground">{row.original.productName}</span>
                        <span className="block text-xs text-muted-foreground">{row.original.categoryName}</span>
                    </>
                ),
            },
            {
                id: 'quantitySold',
                header: 'Unidades',
                accessorFn: (row) => row.quantitySold,
                meta: { align: 'right' },
                cell: ({ row }) => row.original.quantitySold.toLocaleString('es-BO'),
            },
            {
                id: 'totalRevenue',
                header: 'Ingresos',
                accessorFn: (row) => row.totalRevenue,
                meta: { align: 'right' },
                cell: ({ row }) => <span className="font-medium text-foreground">{formatCurrency(row.original.totalRevenue)}</span>,
            },
            {
                id: 'share',
                header: '% venta',
                accessorFn: (row) => (totalSales > 0 ? (row.totalRevenue / totalSales) * 100 : 0),
                meta: { align: 'right' },
                cell: ({ getValue }) => `${Number(getValue()).toLocaleString('es-BO', { maximumFractionDigits: 1 })} %`,
            },
        ],
        [totalSales],
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Trophy className="size-5 text-warning" aria-hidden="true" />
                    Productos estrella
                </CardTitle>
                <p className="text-sm text-muted-foreground">Qué se vende más y cuánto pesa en la venta del periodo</p>
            </CardHeader>
            <CardContent className="space-y-5">
                {loading ? (
                    <Skeleton className="h-72 w-full" />
                ) : products.length === 0 ? (
                    <EmptyState icon={<Trophy />} title="Sin ventas" description="Aún no hay productos vendidos en este periodo." />
                ) : (
                    <>
                        <BarListChart
                            exportId="dashboard-products"
                            ariaLabel="Productos más vendidos por ingresos"
                            data={products.map((product) => ({ label: product.productName, value: product.totalRevenue }))}
                            limit={8}
                        />
                        <DataTable columns={columns} data={products} getRowId={(row) => row.productId} />
                    </>
                )}
            </CardContent>
        </Card>
    )
}
