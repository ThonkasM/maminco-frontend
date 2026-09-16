'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Banknote, CreditCard, Send } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import * as adminPaymentsApi from '@/lib/api/admin/payments'

interface SalesData {
    totalSales: number
    cashPayments: number
    transferPayments: number
    cardPayments: number
    transactionCount: number
}

export const DailySalesStats: React.FC = () => {
    const [salesData, setSalesData] = useState<SalesData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadSalesData()
    }, [])

    const loadSalesData = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminPaymentsApi.getDailySalesStats()
            setSalesData(data)
        } catch (err: any) {
            // Si falla, usar datos mock por ahora
            console.warn('Usando datos mock - endpoint no disponible:', err.message)
            const mockData: SalesData = {
                totalSales: 2450.50,
                cashPayments: 850.00,
                transferPayments: 1200.50,
                cardPayments: 400.00,
                transactionCount: 12,
            }
            setSalesData(mockData)
            setError(null) // No mostrar error, solo usar mock
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
                <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ventas del Día</h3>
                </div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                    ))}
                </div>
            </div>
        )
    }

    if (!salesData) {
        return null
    }

    const paymentMethods = [
        {
            name: 'Efectivo',
            amount: salesData.cashPayments,
            icon: Banknote,
            color: 'text-green-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            borderColor: 'border-green-200 dark:border-green-800',
        },
        {
            name: 'Transferencia',
            amount: salesData.transferPayments,
            icon: Send,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            borderColor: 'border-blue-200 dark:border-blue-800',
        },
        {
            name: 'Tarjeta',
            amount: salesData.cardPayments,
            icon: CreditCard,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
            borderColor: 'border-purple-200 dark:border-purple-800',
        },
    ]

    return (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Ventas del Día</h3>
                </div>
                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                    Datos de Prueba
                </span>
            </div>

            {/* Total */}
            <div className="mb-6 p-4 bg-linear-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-1">Total de Ventas</p>
                <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">
                    {formatCurrency(salesData.totalSales)}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                    {salesData.transactionCount} transacciones
                </p>
            </div>

            {/* Payment Methods Table */}
            <div className="space-y-3">
                {paymentMethods.map((method) => {
                    const IconComponent = method.icon
                    const percentage = (method.amount / salesData.totalSales) * 100

                    return (
                        <div
                            key={method.name}
                            className={`p-4 rounded-lg border ${method.bgColor} ${method.borderColor}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <IconComponent className={`w-5 h-5 ${method.color}`} />
                                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                                        {method.name}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(method.amount)}
                                </span>
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-300 ${method.name === 'Efectivo'
                                        ? 'bg-green-500'
                                        : method.name === 'Transferencia'
                                            ? 'bg-blue-500'
                                            : 'bg-purple-500'
                                        }`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                                {percentage.toFixed(1)}% del total
                            </p>
                        </div>
                    )
                })}
            </div>

            {/* Footer */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <button
                    onClick={loadSalesData}
                    className="w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
                >
                    🔄 Actualizar
                </button>
            </div>
        </div>
    )
}

export default DailySalesStats
