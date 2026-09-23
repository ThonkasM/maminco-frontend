'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { Grid3X3 } from 'lucide-react'

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
        <div className="w-full h-full bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Products
                </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
                {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <Grid3X3 className="w-15 h-15 text-slate-600 dark:text-slate-400" />
                        <p className="text-sm font-medium">Selecciona una categoría</p>
                        <p className="text-xs">para ver los products disponibles</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                        {products.map((product) => (
                            <button
                                key={product.id}
                                onClick={() => onAddProduct(product)}
                                className="group bg-slate-50 dark:bg-slate-700 hover:shadow-lg hover:scale-105 active:scale-95 active:shadow-md transition-all rounded-lg p-4 text-left cursor-pointer border-2 border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 active:border-blue-500 dark:active:border-blue-400"
                            >
                                <p className="font-semibold text-sm text-slate-900 dark:text-white line-clamp-2 mb-1">
                                    {product.name}
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                                    {product.categoryName}
                                </p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400 mb-2">
                                    {formatCurrency(product.price)}
                                </p>
                                <div className="opacity-0 group-hover:opacity-100 transition-all">
                                    <p className="text-xs text-center text-blue-600 dark:text-blue-400 font-semibold">
                                        Agregar
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductCatalog
