'use client'
import React from 'react'
import { OrderResponseDto } from '@/lib/api/negocio/orders'
import { formatCurrency } from '@/lib/utils/currency'
import OrderHistoryTimeline from './OrderHistoryTimeline'

interface OrderDetailModalProps {
    isOpen: boolean
    order: OrderResponseDto | null
    onClose: () => void
}

export default function OrderDetailModal({
    isOpen,
    order,
    onClose,
}: OrderDetailModalProps) {
    if (!isOpen || !order) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Orden #{order.orderNumber}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">
                            Mesa {order.tableName} • {order.serviceType}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        ✕
                    </button>
                </div>

                {/* Items Section */}
                <div className="mb-6">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Items ({order.itemCount})</h3>
                    <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                        {order.items.map((item) => (
                            <div key={item.id} className="space-y-1">
                                <div className="bg-slate-50 dark:bg-slate-700 p-3 rounded">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-medium text-slate-900 dark:text-white">{item.productName}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {formatCurrency(Number(item.unitPrice))} × {item.quantity} ={' '}
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatCurrency(Number(item.subtotal))}
                                                </span>
                                            </p>
                                            {item.notes && (
                                                <p className="text-xs text-slate-600 dark:text-slate-300 italic mt-1">
                                                    💬 {item.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {item.addedByName && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Por: <span className="font-semibold">{item.addedByName}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(Number(order.subtotal))}
                        </span>
                    </div>

                    {order.discountAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-red-600 dark:text-red-400">Descuento:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                                -{formatCurrency(Number(order.discountAmount))}
                            </span>
                        </div>
                    )}

                    {order.tipAmount > 0 && (
                        <div className="flex justify-between text-sm">
                            <span className="text-green-600 dark:text-green-400">Propina:</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                                +{formatCurrency(Number(order.tipAmount))}
                            </span>
                        </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-600 flex justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Total:</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(Number(order.total))}
                        </span>
                    </div>
                </div>

                {/* Status Badge */}
                <div className="mb-6 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Estado</p>
                    <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${order.status === 'BORRADOR'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                : order.status === 'CERRADO'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                            }`}
                    >
                        {order.status}
                    </span>
                </div>

                {/* Order History / Audit Trail */}
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600 max-h-96 overflow-y-auto">
                    <OrderHistoryTimeline orderId={order.id} isOpen={isOpen} />
                </div>

                {/* Close Button */}
                <div className="flex gap-2">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg transition-all font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    )
}
