'use client'

import React from 'react'
import { CreditCard, Banknote, Building2 } from 'lucide-react'

export interface PaymentMethod {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
}

interface PaymentMethodSelectorProps {
    methods: PaymentMethod[]
    selectedMethodId: string | null
    onSelectMethod: (methodId: string) => void
    loading?: boolean
}

const getPaymentIcon = (code: string) => {
    switch (code) {
        case 'CASH':
            return <Banknote className="w-8 h-8" />
        case 'TRANSFER':
            return <Building2 className="w-8 h-8" />
        case 'CARD':
            return <CreditCard className="w-8 h-8" />
        default:
            return <CreditCard className="w-8 h-8" />
    }
}

const getPaymentColor = (code: string) => {
    switch (code) {
        case 'CASH':
            return 'from-green-500 to-green-600'
        case 'TRANSFER':
            return 'from-blue-500 to-blue-600'
        case 'CARD':
            return 'from-purple-500 to-purple-600'
        default:
            return 'from-slate-500 to-slate-600'
    }
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    methods,
    selectedMethodId,
    onSelectMethod,
    loading = false,
}) => {
    const activePaymentMethods = methods.filter(m => m.isActive)

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                    Métodos de Pago
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    {activePaymentMethods.length} disponible{activePaymentMethods.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Métodos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activePaymentMethods.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-medium">Sin métodos disponibles</p>
                        <p className="text-xs">Activa métodos en el panel de gestión</p>
                    </div>
                ) : (
                    activePaymentMethods.map((method) => (
                        <button
                            key={method.id}
                            onClick={() => {
                                console.log('🎯 Método de pago seleccionado:', {
                                    id: method.id,
                                    name: method.name,
                                    code: method.code,
                                    description: method.description
                                })
                                !loading && onSelectMethod(method.id)
                            }}
                            disabled={loading}
                            className={`w-full p-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 border-2 ${
                                selectedMethodId === method.id
                                    ? method.code === 'CASH'
                                        ? 'bg-linear-to-r from-green-500 to-green-600 text-white border-white shadow-lg'
                                        : method.code === 'TRANSFER'
                                        ? 'bg-linear-to-r from-blue-500 to-blue-600 text-white border-white shadow-lg'
                                        : method.code === 'CARD'
                                        ? 'bg-linear-to-r from-purple-500 to-purple-600 text-white border-white shadow-lg'
                                        : 'bg-linear-to-r from-slate-500 to-slate-600 text-white border-white shadow-lg'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={selectedMethodId === method.id ? 'text-white' : 'text-slate-700 dark:text-slate-300'}>
                                    {getPaymentIcon(method.code)}
                                </div>
                                <div className="flex-1 text-left">
                                    <p className="font-semibold text-sm">
                                        {method.name}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

export default PaymentMethodSelector
