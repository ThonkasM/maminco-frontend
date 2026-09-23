'use client'
import {
    BarChart3,
    ClipboardList,
    DollarSign,
    Package,
    UtensilsCrossed,
} from 'lucide-react'
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    EmptyState,
    Skeleton,
    Table,
    TableWrapper,
    TBody,
    Td,
    Th,
    THead,
    Tr,
} from '@/components/ui'
import type { DailySalesDto, TopProductDto } from '../api'

interface TopProductsTableProps {
    products: TopProductDto[]
    loading?: boolean
}

export function TopProductsTable({
    products,
    loading = false,
}: TopProductsTableProps) {
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
                ) : products.length === 0 ? (
                    <EmptyState
                        icon={<Package />}
                        title="Sin datos"
                        description="No hay productos vendidos para mostrar."
                    />
                ) : (
                    <TableWrapper>
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>#</Th>
                                    <Th>Producto</Th>
                                    <Th>Categoría</Th>
                                    <Th className="text-right">Cantidad</Th>
                                    <Th className="text-right">
                                        Precio unit.
                                    </Th>
                                    <Th className="text-right">Total</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {products.map((product, index) => (
                                    <Tr key={product.productId}>
                                        <Td className="text-muted-foreground">
                                            {index + 1}
                                        </Td>
                                        <Td className="font-medium text-foreground">
                                            {product.productName}
                                        </Td>
                                        <Td className="text-muted-foreground">
                                            {product.categoryName}
                                        </Td>
                                        <Td className="text-right text-foreground">
                                            {product.quantitySold}
                                        </Td>
                                        <Td className="text-right text-foreground">
                                            Bs.{' '}
                                            {Math.round(
                                                Number(product.unitPrice),
                                            ).toLocaleString()}
                                        </Td>
                                        <Td className="text-right font-semibold text-success">
                                            Bs.{' '}
                                            {Math.round(
                                                Number(product.totalRevenue),
                                            ).toLocaleString()}
                                        </Td>
                                    </Tr>
                                ))}
                            </TBody>
                        </Table>
                    </TableWrapper>
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
            value: `Bs. ${Math.round(Number(sales.totalSales)).toLocaleString()}`,
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
            value: `Bs. ${Math.round(Number(sales.averageOrderValue)).toLocaleString()}`,
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
