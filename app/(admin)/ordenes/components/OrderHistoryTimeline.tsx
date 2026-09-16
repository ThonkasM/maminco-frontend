'use client'

import React, { useState, useEffect } from 'react'
import { OrderHistoryTable } from './OrderHistoryTable'
import * as adminOrdersApi from '@/lib/api/admin/orders'
import { OrderHistoryTimelineEntry, PaginationInfo } from '@/lib/api/admin/orders'

interface OrderHistoryTimelineProps {
    orderId: string
    isOpen?: boolean
}

export const OrderHistoryTimeline: React.FC<OrderHistoryTimelineProps> = ({ orderId, isOpen = true }) => {
    const [history, setHistory] = useState<OrderHistoryTimelineEntry[]>([])
    const [pagination, setPagination] = useState<PaginationInfo | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const LIMIT = 50

    useEffect(() => {
        if (!isOpen) return

        loadHistory(1)
    }, [orderId, isOpen])

    const loadHistory = async (page: number) => {
        try {
            setLoading(true)
            setError(null)
            const response = await adminOrdersApi.getOrderHistoryTimeline(orderId, page, LIMIT)
            // El backend ya proporciona metadata y detail procesados
            setHistory(response.timeline || [])
            setPagination(response.pagination)
            setCurrentPage(page)
        } catch (err: any) {
            setError(err.message || 'Error cargando historial')
            console.error('Error loading order history:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleNextPage = () => {
        if (pagination?.hasNextPage) {
            loadHistory(currentPage + 1)
        }
    }

    const handlePreviousPage = () => {
        if (pagination?.hasPreviousPage) {
            loadHistory(currentPage - 1)
        }
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    📋 Historial de Auditoría
                    <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded-full text-slate-600 dark:text-slate-400 font-normal">
                        {pagination?.total || 0} total
                    </span>
                </h3>
                <button
                    onClick={() => loadHistory(currentPage)}
                    disabled={loading}
                    className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded transition-colors disabled:opacity-50"
                >
                    🔄 Actualizar
                </button>
            </div>

            <OrderHistoryTable history={history} isLoading={loading} />

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                        Página {pagination.page} de {pagination.totalPages} ({pagination.total} registros)
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePreviousPage}
                            disabled={!pagination.hasPreviousPage || loading}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Anterior
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={!pagination.hasNextPage || loading}
                            className="px-3 py-1 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default OrderHistoryTimeline
