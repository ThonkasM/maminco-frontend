'use client'

import React from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import { PrintOrderButton } from '@/components/printing/PrintOrderButton'

interface CartSummaryProps {
    subtotal: number
    paymentMode: boolean
    totalPaid: number
    orderId?: string
    orderNumber?: string
    onCancelOrder: () => void
    onStartPayment: () => void
    onFinalizePayment: () => void
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    paymentMode,
    totalPaid,
    orderId,
    orderNumber,
    onCancelOrder,
    onStartPayment,
    onFinalizePayment,
}) => {
    return (
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 space-y-3">
            {/* Total a Pagar */}
            <div className="flex justify-between text-sm border-b border-slate-200 dark:border-slate-600 pb-3">
                <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                <span className="font-bold text-slate-900 dark:text-white text-lg">
                    {formatCurrency(subtotal)}
                </span>
            </div>
            {/* Botón Cancelar Orden */}
            <button
                onClick={onCancelOrder}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all text-sm"
                title="Cancelar la orden y volver a mesas"
            >
                ✕ Cancelar Order
            </button>

            {/* Botón Cerrar & Cobrar o Finalizar */}
            {paymentMode ? (
                <button
                    onClick={onFinalizePayment}
                    disabled={totalPaid < subtotal}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all text-sm"
                    title={totalPaid >= subtotal ? 'Finalizar y cerrar orden' : `Falta ${formatCurrency(subtotal - totalPaid)}`}
                >
                    {totalPaid >= subtotal ? '✓ Finalizar' : '💳 Agregando Pago'}
                </button>
            ) : (
                <button
                    onClick={onStartPayment}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all text-sm"
                    title="Registrar pagos y cerrar orden"
                >
                    💳 Cerrar & Cobrar
                </button>
            )}

            {/* Botón Imprimir Orden */}
            {orderId && orderNumber && (
                <PrintOrderButton
                    orderId={orderId}
                    orderNumber={orderNumber}
                    disabled={paymentMode}
                />
            )}
        </div>
    )
}

export default CartSummary
