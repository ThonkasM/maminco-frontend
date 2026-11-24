'use client'

import React from 'react'
import { LayoutGrid } from 'lucide-react'
import { Badge, Button, EmptyState } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductResponse {
    id: string
    name: string
    categoryName: string
    price: number
}

interface ProductCatalogProps {
    products: ProductResponse[]
    onAddProduct: (product: ProductResponse) => void
    /** Quantity of each product in the current order (productId → qty). */
    quantities?: Record<string, number>
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
    products,
    onAddProduct,
    quantities = {},
}) => {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-surface">
            <div className="hidden shrink-0 border-b border-border bg-surface-muted p-4 md:block">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Productos
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4">
                {products.length === 0 ? (
                    <EmptyState
                        icon={<LayoutGrid />}
                        title="Selecciona una categoría"
                        description="Elige una categoría para ver los productos disponibles."
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        {products.map((product) => {
                            const quantity = quantities[product.id] ?? 0
                            return (
                                <Button
                                    key={product.id}
                                    variant="secondary"
                                    onClick={() => onAddProduct(product)}
                                    className="group relative h-auto flex-col items-start justify-start gap-0 whitespace-normal rounded-lg border-2 p-3 text-left md:p-4 transition-all hover:border-primary hover:shadow-elevated active:scale-95"
                                >
                                    {quantity > 0 && (
                                        <Badge
                                            variant="info"
                                            className="absolute right-2 top-2 border-transparent bg-primary text-primary-foreground"
                                            aria-label={`${quantity} en el pedido`}
                                        >
                                            x{quantity}
                                        </Badge>
                                    )}
                                    <p className="mb-1 line-clamp-2 pr-8 text-sm font-semibold text-foreground">
                                        {product.name}
                                    </p>
                                    <p className="mb-3 text-xs font-normal text-muted-foreground">
                                        {product.categoryName}
                                    </p>
                                    <p className="mb-2 text-lg font-bold text-primary">
                                        {formatCurrency(product.price)}
                                    </p>
                                    <span className="w-full text-center text-xs font-semibold text-primary opacity-0 transition-all group-hover:opacity-100">
                                        Agregar
                                    </span>
                                </Button>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductCatalog
