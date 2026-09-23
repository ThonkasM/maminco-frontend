'use client'
import React, { useState } from 'react'
import { OrderResponseDto, OrderStatus } from '@/features/pos/orders/api'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/shared/ToastProvider'
import AdminGuard from '@/features/auth/components/AdminGuard'
import { formatCurrency } from '@/lib/utils/currency'
import { useOrders } from '@/features/orders/hooks/useOrders'
import OrderTable from '@/features/orders/components/OrderTable'
import OrderDetailModal from '@/features/orders/components/OrderDetailModal'

function OrdenesPageContent() {
    const user = useAuth((s) => s.user)
    const {
        orders,
        tables,
        loading,
        page,
        statusFilter,
        tableFilter,
        serviceTypeFilter,
        setPage,
        setStatusFilter,
        setTableFilter,
        setServiceTypeFilter,
    } = useOrders()

    // Estados para modal de detalle
    const [selectedOrder, setSelectedOrder] = useState<OrderResponseDto | null>(null)
    const [showOrderDetail, setShowOrderDetail] = useState(false)

    const handleViewOrder = (order: OrderResponseDto) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    const handleCloseDetail = () => {
        setShowOrderDetail(false)
        setSelectedOrder(null)
    }

    return (
        <AdminGuard>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Órdenes</h1>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estado</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as OrderStatus | '')
                                    setPage(1)
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Todos</option>
                                <option value="DRAFT">Borrador</option>
                                <option value="CLOSED">Cerrado</option>
                                <option value="CANCELLED">Cancelado</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tipo de Servicio</label>
                            <select
                                value={serviceTypeFilter}
                                onChange={(e) => {
                                    setServiceTypeFilter(e.target.value as string | '')
                                    setPage(1)
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Todos</option>
                                <option value="EXTERIOR">Exterior</option>
                                <option value="SALON">Salón</option>
                                <option value="DELIVERY">Delivery</option>
                                <option value="RECOGER">Para Recoger</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Table</label>
                            <select
                                value={tableFilter}
                                onChange={(e) => {
                                    setTableFilter(e.target.value)
                                    setPage(1)
                                }}
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            >
                                <option value="">Todas</option>
                                {tables.map((table) => (
                                    <option key={table.id} value={table.id}>
                                        Table {table.number}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setStatusFilter('')
                                    setTableFilter('')
                                    setServiceTypeFilter('')
                                    setPage(1)
                                }}
                                className="w-full px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white rounded-lg hover:bg-slate-400 dark:hover:bg-slate-500 transition-all"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading / Error */}
                {loading && <div className="text-center py-12 text-slate-600">Cargando órdenes...</div>}

                {/* Orders Table */}
                {!loading && orders && (
                    <div>
                        <OrderTable orders={orders} onViewDetail={handleViewOrder} />

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                Mostrando {orders.data.length} de {orders.total} órdenes
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(Math.max(1, page - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                                >
                                    ← Anterior
                                </button>
                                <span className="px-4 py-2">{page} / {orders.totalPages}</span>
                                <button
                                    onClick={() => setPage(Math.min(orders.totalPages, page + 1))}
                                    disabled={page === orders.totalPages}
                                    className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Detail Modal */}
                <OrderDetailModal
                    isOpen={showOrderDetail}
                    order={selectedOrder}
                    onClose={handleCloseDetail}
                />
            </div>
        </AdminGuard>
    )
}

export default function OrdenesPage() {
    return <OrdenesPageContent />
}
