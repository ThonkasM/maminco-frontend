'use client'
import React, { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils/currency'

interface DiscountModalProps {
    isOpen: boolean
    totalAmount: number
    onSubmit: (type: 'percentage' | 'fixed', amount: number, reason: string) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export default function DiscountModal({ isOpen, totalAmount, onSubmit, onClose, isLoading }: DiscountModalProps) {
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
    const [amount, setAmount] = useState(0)
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const discountPreview = useMemo(() => {
        if (type === 'percentage') {
            const discountAmount = (totalAmount * amount) / 100
            return {
                discountAmount,
                finalTotal: totalAmount - discountAmount,
                display: `${amount}%`,
            }
        } else {
            return {
                discountAmount: amount,
                finalTotal: totalAmount - amount,
                display: formatCurrency(amount),
            }
        }
    }, [type, amount, totalAmount])

    const handleSubmit = async () => {
        if (amount <= 0) return

        setSubmitting(true)
        try {
            await onSubmit(type, amount, reason)
            setAmount(0)
            setReason('')
            setType('percentage')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setAmount(0)
        setReason('')
        setType('percentage')
        onClose()
    }

    if (!isOpen) return null

    const isValid = amount > 0 && (type === 'fixed' ? amount <= totalAmount : amount <= 100)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">💰 Aplicar Descuento</h3>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* Type Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Tipo de Descuento
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setType('percentage')}
                            disabled={submitting}
                            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                                type === 'percentage'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            Porcentaje (%)
                        </button>
                        <button
                            onClick={() => setType('fixed')}
                            disabled={submitting}
                            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                                type === 'fixed'
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            Monto Fijo
                        </button>
                    </div>
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Monto ({type === 'percentage' ? '%' : 'Bs.'})
                    </label>
                    <input
                        type="number"
                        min="0"
                        max={type === 'percentage' ? 100 : totalAmount}
                        value={amount}
                        onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        disabled={submitting}
                        placeholder={type === 'percentage' ? 'Ej: 10' : 'Ej: 50000'}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    />
                    {type === 'percentage' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">Máximo: 100%</p>
                    )}
                    {type === 'fixed' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Máximo: {formatCurrency(totalAmount)}
                        </p>
                    )}
                </div>

                {/* Reason */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Razón (opcional)
                    </label>
                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    >
                        <option value="">Selecciona una razón...</option>
                        <option value="Cortesía">Cortesía</option>
                        <option value="Promoción">Promoción</option>
                        <option value="Cliente Especial">Cliente Especial</option>
                        <option value="Error de Precio">Error de Precio</option>
                        <option value="Compensación">Compensación</option>
                        <option value="Otra">Otra</option>
                    </select>
                </div>

                {/* Preview */}
                {amount > 0 && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-700 dark:text-slate-300">Total Original:</span>
                            <span className="font-semibold text-slate-900 dark:text-white">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-red-600 dark:text-red-400">Descuento:</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                                -{discountPreview.display}
                            </span>
                        </div>
                        <div className="border-t border-orange-200 dark:border-orange-700 pt-2 flex justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">Total Final:</span>
                            <span className="font-bold text-orange-600 dark:text-orange-400">
                                {formatCurrency(discountPreview.finalTotal)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                        className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Aplicando...' : 'Aplicar'}
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-all disabled:opacity-50 font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
