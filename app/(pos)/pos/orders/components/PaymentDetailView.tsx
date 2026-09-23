'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils/currency'

interface RegisteredPayment {
    methodName: string
    methodCode: string
    amount: number
}

interface PaymentDetailViewProps {
    subtotal: number
    registeredPayments: RegisteredPayment[]
    change: number
    totalPaid: number
    onBack: () => void
    onAddPayment: () => void
    onFinalize: () => void
}

export const PaymentDetailView: React.FC<PaymentDetailViewProps> = ({
    subtotal,
    registeredPayments,
    change,
    totalPaid,
    onBack,
    onAddPayment,
    onFinalize,
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Detalle de Payment
                </h3>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Payments Breakdown Section */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Payments Registrados
                    </label>
                    {registeredPayments.length > 0 ? (
                        <div className="space-y-2">
                            {registeredPayments.map((payment, idx) => (
                                <div
                                    key={idx}
                                    className="bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border-l-4 border-green-500 flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200">
                                            {payment.methodName}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-green-600 dark:text-green-400">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                </div>
                            ))}
                            {/* Total Pagado */}
                            <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 flex items-center justify-between border border-slate-300 dark:border-slate-600">
                                <span className="font-bold text-slate-900 dark:text-white">Total Pagado:</span>
                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                    {formatCurrency(totalPaid)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                No hay payments registrados aún
                            </p>
                        </div>
                    )}
                </div>
                {/* Subtotal Section */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Subtotal a Pagar
                    </label>
                    <div className="bg-linear-to-r from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-600 rounded-lg p-4 border border-slate-200 dark:border-slate-600">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white text-right">
                            {formatCurrency(subtotal)}
                        </p>
                    </div>
                </div>
                {/* Change Section */}
                {totalPaid > 0 && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                            Estado de Cambio
                        </label>
                        <div
                            className={`rounded-lg p-4 border-l-4 ${
                                change > 0
                                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
                                    : change === 0
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                                        : 'bg-red-50 dark:bg-red-900/20 border-red-500'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className={`text-sm font-bold uppercase tracking-wide ${
                                        change > 0
                                            ? 'text-blue-700 dark:text-blue-300'
                                            : change === 0
                                                ? 'text-green-700 dark:text-green-300'
                                                : 'text-red-700 dark:text-red-300'
                                    }`}
                                >
                                    {change > 0 ? '🔄 Cambio a Dar' : change === 0 ? '✓ Monto Exacto' : '⚠️ Falta Pagar'}
                                </span>
                            </div>
                            <p
                                className={`text-2xl font-bold text-right ${
                                    change > 0
                                        ? 'text-blue-600 dark:text-blue-400'
                                        : change === 0
                                            ? 'text-green-600 dark:text-green-400'
                                            : 'text-red-600 dark:text-red-400'
                                }`}
                            >
                                {formatCurrency(Math.abs(change))}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - Botones de Acción */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 space-y-2 shrink-0">

                <button
                    onClick={onBack}
                    className="w-full px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-medium transition-all text-sm"
                >
                    ← Volver
                </button>
            </div>
        </div>
    )
}

export default PaymentDetailView
