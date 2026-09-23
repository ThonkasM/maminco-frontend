'use client'
import React from 'react'
import { PaginatedProductsResponse, ProductResponse } from '@/features/products/api'
import { formatCurrency } from '@/lib/utils/currency'

interface ProductsTableProps {
    products: PaginatedProductsResponse | null
    loading: boolean
    error: string | null
    page: number
    onPageChange: (page: number) => void
    onEdit: (product: ProductResponse) => void
    onDelete: (product: ProductResponse) => void
    getCategoryName: (categoryId: string) => string
}

export default function ProductsTable({
    products,
    loading,
    error,
    page,
    onPageChange,
    onEdit,
    onDelete,
    getCategoryName,
}: ProductsTableProps) {
    if (loading) {
        return <div className="text-center py-12 text-slate-600 dark:text-slate-400">Cargando products...</div>
    }

    if (error) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
                {error}
            </div>
        )
    }

    if (!products) {
        return null
    }

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Categoría
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Precio
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.data.map((product) => (
                            <tr
                                key={product.id}
                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                            >
                                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                                    {product.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                                    {getCategoryName(product.categoryId)}
                                </td>
                                <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">
                                    {formatCurrency(Number(product.price))}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            product.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {product.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button
                                        onClick={() => onEdit(product)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(product)}
                                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                                    >
                                        🗑️ Desactivar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mostrando {products.data.length} de {products.total} products
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        ← Anterior
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: products.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                    p === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(products.totalPages, page + 1))}
                        disabled={page === products.totalPages}
                        className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    )
}
