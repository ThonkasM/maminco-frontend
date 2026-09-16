'use client'

import React, { useState } from 'react'
import { Building2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'

interface TransferenciaPaymentFormProps {
    total: number
    onSubmit?: (data: { method: string; amount: number; referenceNumber: string }) => void
    onBack?: () => void
}

export const TransferenciaPaymentForm: React.FC<TransferenciaPaymentFormProps> = ({ total, onSubmit, onBack }) => {
    const [amountPaid, setAmountPaid] = useState('')
    const [referenceNumber, setReferenceNumber] = useState('')

    const paidAmount = parseFloat(amountPaid) || 0
    const difference = paidAmount - total
    const canConfirm = paidAmount > 0 // Permite CUALQUIER monto > 0

    const handleDigitClick = (digit: string | number) => {
        if (digit === '←') {
            setAmountPaid(amountPaid.slice(0, -1))
        } else if (digit === '.') {
            if (!amountPaid.includes('.')) {
                setAmountPaid(amountPaid + '.')
            }
        } else if (digit === '✓') {
            if (canConfirm) {
                onSubmit?.({ method: 'TRANSFER', amount: paidAmount, referenceNumber: referenceNumber || 'Manual' })
            }
        } else {
            setAmountPaid(amountPaid + digit)
        }
    }

    const buttonGrid = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
        [0, '.', '←'],
    ]

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-linear-to-r from-blue-500 to-blue-600 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                            Transferencia Bancaria
                        </h3>
                        <p className="text-xs text-blue-50">
                            Ingresa monto que está pagando
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Display de Monto Pagado */}
                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg border-2 border-slate-300 dark:border-slate-600">
                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Monto Ingresado:</p>
                    <p className="text-3xl font-bold font-mono text-slate-900 dark:text-white min-h-10">
                        {amountPaid ? formatCurrency(Number(amountPaid)) : '─'}
                    </p>
                </div>

                {/* Teclado Numérico */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                        Monto Pagado
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {buttonGrid.flat().map((btn, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleDigitClick(btn)}
                                className={`p-4 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                                    btn === '←'
                                        ? 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white'
                                        : 'bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                                }`}
                            >
                                {btn}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 space-y-2 shrink-0">
                <button
                    disabled={!canConfirm}
                    onClick={() => handleDigitClick('✓')}
                    className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all"
                >
                    Registar Pago por Transferencia
                </button>
                <button
                    onClick={onBack}
                    className="w-full px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-lg font-medium transition-all text-sm"
                >
                    ← Volver a detalle
                </button>
            </div>
        </div>
    )
}

export default TransferenciaPaymentForm
