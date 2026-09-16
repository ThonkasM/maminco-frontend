'use client'

import React from 'react'
import { OrderHistoryTimelineEntry } from '@/lib/api/admin/orders'

interface OrderHistoryTableProps {
    history: OrderHistoryTimelineEntry[]
    isLoading?: boolean
}

export const OrderHistoryTable: React.FC<OrderHistoryTableProps> = ({ history, isLoading = false }) => {
    if (isLoading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
                ))}
            </div>
        )
    }

    if (!history || history.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">No hay historial disponible</p>
            </div>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                    <tr>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Hora</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Acción</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Usuario</th>
                        <th className="px-4 py-3 text-left font-semibold text-slate-900 dark:text-white">Descripción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {history.map((entry, index) => (
                        <tr
                            key={entry.id || index}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                {entry.timestamp}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <span className="text-xl mr-2">{entry.emoji}</span>
                                <span className="font-medium text-slate-900 dark:text-white">
                                    {entry.action}
                                </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                {entry.user}
                            </td>
                            <td className="px-4 py-3 text-slate-600 dark:text-slate-400 max-w-xs">
                                <span className="truncate block" title={entry.detail || entry.description}>
                                    {entry.detail || entry.description || '-'}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default OrderHistoryTable
