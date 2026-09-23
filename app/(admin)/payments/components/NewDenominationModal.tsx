'use client'
import React, { useState } from 'react'

interface NewDenominationModalProps {
    isOpen: boolean
    onSubmit: (value: string, type: 'COIN' | 'BILL') => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export default function NewDenominationModal({ isOpen, onSubmit, onClose, isLoading }: NewDenominationModalProps) {
    const [value, setValue] = useState('')
    const [type, setType] = useState<'COIN' | 'BILL'>('COIN')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!value.trim() || value === '0') return

        setSubmitting(true)
        try {
            await onSubmit(value, type)
            setValue('')
            setType('COIN')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setValue('')
        setType('COIN')
        onClose()
    }

    if (!isOpen) return null

    const isValid = value.trim() && value !== '0'

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">+ Nueva Denominación</h3>
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
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Tipo</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setType('COIN')}
                            disabled={submitting}
                            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                                type === 'COIN'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            💰 Moneda
                        </button>
                        <button
                            onClick={() => setType('BILL')}
                            disabled={submitting}
                            className={`px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 ${
                                type === 'BILL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                            }`}
                        >
                            💵 Billete
                        </button>
                    </div>
                </div>

                {/* Value Input */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Valor (Bs.)
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        disabled={submitting}
                        placeholder={type === 'COIN' ? 'Ej: 1, 5, 10' : 'Ej: 50, 100, 200'}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ingresa solo el número sin "Bs."</p>
                </div>

                {/* Preview */}
                {value && value !== '0' && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-center">
                        <p className="text-sm text-slate-600 dark:text-slate-400">Preview:</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            Bs. {value} {type === 'COIN' ? '🪙' : '💵'}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || submitting}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Creando...' : 'Crear'}
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
