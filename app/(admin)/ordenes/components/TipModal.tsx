'use client'
import React, { useState, useMemo } from 'react'
import { formatCurrency } from '@/lib/utils/currency'

interface TipModalProps {
    isOpen: boolean
    totalAmount: number
    onSubmit: (tipAmount: number) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export default function TipModal({ isOpen, totalAmount, onSubmit, onClose, isLoading }: TipModalProps) {
    const [tipAmount, setTipAmount] = useState(0)
    const [tipPercentage, setTipPercentage] = useState(10)
    const [submitting, setSubmitting] = useState(false)

    const totalWithTip = useMemo(() => totalAmount + tipAmount, [totalAmount, tipAmount])

    const quickTip = (percentage: number) => {
        const calculated = Math.round((totalAmount * percentage) / 100)
        setTipPercentage(percentage)
        setTipAmount(calculated)
    }

    const handleSubmit = async () => {
        if (tipAmount < 0) return

        setSubmitting(true)
        try {
            await onSubmit(tipAmount)
            setTipAmount(0)
            setTipPercentage(10)
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setTipAmount(0)
        setTipPercentage(10)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">💵 Agregar Propina</h3>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* Current Total */}
                <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total (sin propina)</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                    </p>
                </div>

                {/* Quick Tips */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Propina Sugerida
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {[5, 10, 15].map((percentage) => (
                            <button
                                key={percentage}
                                onClick={() => quickTip(percentage)}
                                disabled={submitting}
                                className={`px-3 py-2 rounded-lg font-medium transition-all disabled:opacity-50 text-sm ${
                                    tipPercentage === percentage
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {percentage}%
                            </button>
                        ))}
                    </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Monto Personalizado
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={tipAmount}
                        onChange={(e) => {
                            const newAmount = Math.max(0, parseInt(e.target.value) || 0)
                            setTipAmount(newAmount)
                            setTipPercentage(0)
                        }}
                        disabled={submitting}
                        placeholder="Ingresa monto de propina"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    />
                </div>

                {/* Summary */}
                <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg space-y-2 border-2 border-purple-200 dark:border-purple-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-700 dark:text-slate-300">Subtotal:</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                            {formatCurrency(totalAmount)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-purple-600 dark:text-purple-400">Propina:</span>
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                            +{formatCurrency(tipAmount)}
                        </span>
                    </div>
                    <div className="border-t border-purple-200 dark:border-purple-700 pt-2 flex justify-between">
                        <span className="font-bold text-slate-900 dark:text-white">Total:</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                            {formatCurrency(totalWithTip)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Agregando...' : 'Agregar'}
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
