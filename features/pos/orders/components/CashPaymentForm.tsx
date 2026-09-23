'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, Banknote } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import * as adminPaymentsApi from '@/features/payments/api'

export interface CashDenomination {
    id: string
    value: number
    type: 'COIN' | 'BILL'
    quantity: number
    isActive: boolean
}

interface CashPaymentFormProps {
    total: number
    onSubmit?: (data: { method: string; amount: number; denominations: any[] }) => void
    onBack?: () => void
}

export const CashPaymentForm: React.FC<CashPaymentFormProps> = ({ total, onSubmit, onBack }) => {
    const [denominations, setDenominations] = useState<CashDenomination[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [receivedAmount, setReceivedAmount] = useState<number>(0)
    const [change, setChange] = useState<number>(0)

    useEffect(() => {
        loadDenominations()
    }, [])

    useEffect(() => {
        setChange(Math.max(0, receivedAmount - total))
    }, [receivedAmount, total])

    const loadDenominations = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminPaymentsApi.listCashDenominations(true)
            setDenominations(data.filter(d => d.isActive).map(d => ({
                id: d.id,
                value: d.value,
                type: d.type as 'COIN' | 'BILL',
                quantity: d.quantity,
                isActive: d.isActive
            })))
        } catch (err: any) {
            setError(err.message || 'Error cargando denominaciones')
            console.error('Error loading denominations:', err)
        } finally {
            setLoading(false)
        }
    }

    const coinDenoms = denominations.filter(d => d.type === 'COIN')
    const billDenoms = denominations.filter(d => d.type === 'BILL')

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-linear-to-r from-green-500 to-green-600 shrink-0">
                <div className="flex items-center gap-3">
                    <Banknote className="w-6 h-6 text-white" />
                    <div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                            Payment en Cash
                        </h3>
                        <p className="text-xs text-green-50">
                            Selecciona denominaciones para desglose
                        </p>
                    </div>
                </div>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Cantidad Recibida */}
                <div className="bg-slate-100 dark:bg-slate-700 rounded-lg p-4">
                    <label className="text-sm text-slate-600 dark:text-slate-400 block mb-2">
                        Cantidad Recibida
                    </label>
                    <input
                        type="number"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 text-lg font-bold bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                )}

                {/* Denominaciones */}
                {!loading && denominations.length > 0 && (
                    <>
                        {billDenoms.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-3">
                                    Billetes
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {billDenoms.map((denom) => (
                                        <button
                                            key={denom.id}
                                            onClick={() => setReceivedAmount(receivedAmount + denom.value)}
                                            className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border-2 border-slate-200 dark:border-slate-600 hover:border-green-500 dark:hover:border-green-500 flex flex-col items-center justify-center w-35 h-35"
                                            title={`Agregar Bs ${denom.value}`}
                                        >
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {denom.value}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {coinDenoms.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase mb-3">
                                    Monedas
                                </h4>
                                <div className="grid grid-cols-4 gap-3">
                                    {coinDenoms.map((denom) => (
                                        <button
                                            key={denom.id}
                                            onClick={() => setReceivedAmount(receivedAmount + denom.value)}
                                            className="aspect-square rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border-2 border-slate-200 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-500 flex flex-col items-center justify-center h-35 w-35"
                                            title={`Agregar Bs ${denom.value}`}
                                        >
                                            <p className="text-base font-bold text-slate-900 dark:text-white">
                                                {denom.value}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer - Botones */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 space-y-2 shrink-0">
                <button
                    disabled={receivedAmount <= 0 || loading}
                    onClick={() => onSubmit?.({ method: 'CASH', amount: receivedAmount, denominations: [] })}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all"
                >
                    Registrar Payment con Cash
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

export default CashPaymentForm
