'use client'
import React from 'react'
import { TopProductDto, DailySalesDto } from '@/features/dashboard/api'

interface TopProductsTableProps {
    products: TopProductDto[]
    loading?: boolean
}

export function TopProductsTable({ products, loading = false }: TopProductsTableProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📦 Products Más Vendidos</h3>
                <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-12 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">📦 Products Más Vendidos</h3>

            {products.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center py-8">No hay datos disponibles</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">#</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-900 dark:text-white">Categoría</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white">Cantidad</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white">Precio Unit.</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-900 dark:text-white">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            {products.map((product, idx) => (
                                <tr key={product.productId} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900 dark:text-white">{idx + 1}</td>
                                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{product.productName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{product.categoryName}</td>
                                    <td className="px-6 py-4 text-sm text-right text-slate-900 dark:text-white font-medium">{product.quantitySold}</td>
                                    <td className="px-6 py-4 text-sm text-right text-slate-900 dark:text-white">
                                        Bs. {Math.round(Number(product.unitPrice)).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600 dark:text-green-400">
                                        Bs. {Math.round(Number(product.totalRevenue)).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

interface SalesSummaryCardProps {
    sales: DailySalesDto
    loading?: boolean
}

export function SalesSummaryCard({ sales, loading = false }: SalesSummaryCardProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-24 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse" />
                ))}
            </div>
        )
    }

    const cards = [
        {
            label: 'Total Ventas',
            value: `Bs. ${Math.round(Number(sales.totalSales)).toLocaleString()}`,
            icon: '💰',
            color: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-700 dark:text-green-400',
        },
        {
            label: 'Total Órdenes',
            value: sales.totalOrders.toLocaleString(),
            icon: '📋',
            color: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-700 dark:text-blue-400',
        },
        {
            label: 'Promedio/Orden',
            value: `Bs. ${Math.round(Number(sales.averageOrderValue)).toLocaleString()}`,
            icon: '📊',
            color: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-700 dark:text-purple-400',
        },
        {
            label: 'Mesas Activas',
            value: sales.mesaOrders.toLocaleString(),
            icon: '🍽️',
            color: 'bg-orange-50 dark:bg-orange-900/20',
            textColor: 'text-orange-700 dark:text-orange-400',
        },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {cards.map((card) => (
                <div key={card.label} className={`${card.color} rounded-lg p-4 border border-slate-200 dark:border-slate-700`}>
                    <div className="text-2xl mb-2">{card.icon}</div>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase">{card.label}</p>
                    <p className={`text-xl font-bold mt-2 ${card.textColor}`}>{card.value}</p>
                </div>
            ))}
        </div>
    )
}
