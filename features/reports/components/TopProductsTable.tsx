'use client'
import { Package } from 'lucide-react'
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
                                    <Th className="text-right">Ingresos</Th>
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
                                            {formatCurrency(product.unitPrice)}
                                        </Td>
                                        <Td className="text-right font-semibold text-success">
                                            {formatCurrency(
                                                product.totalRevenue,
                                            )}
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
