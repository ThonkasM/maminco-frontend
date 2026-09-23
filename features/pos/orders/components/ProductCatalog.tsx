'use client'

import React from 'react'
import { LayoutGrid } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'
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
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
    products,
    onAddProduct,
}) => {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-surface-muted p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Productos
                </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                {products.length === 0 ? (
                    <EmptyState
                        icon={<LayoutGrid />}
                        title="Selecciona una categoría"
                        description="Elige una categoría para ver los productos disponibles."
                    />
                ) : (
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                        {products.map((product) => (
                            <Button
                                key={product.id}
                                variant="secondary"
                                onClick={() => onAddProduct(product)}
                                className="group h-auto flex-col items-start justify-start gap-0 whitespace-normal rounded-lg border-2 p-4 text-left transition-all hover:border-primary hover:shadow-elevated active:scale-95"
                            >
                                <p className="mb-1 line-clamp-2 text-sm font-semibold text-foreground">
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductCatalog
