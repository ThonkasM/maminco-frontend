'use client'

import React from 'react'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CashPaymentForm } from './CashPaymentForm'
import { TransferPaymentForm } from './TransferPaymentForm'
import { CardPaymentForm } from './CardPaymentForm'

export interface PaymentMethod {
    id: string
    name: string
    code: string
    description?: string
    isActive: boolean
}

interface PaymentContainerProps {
    paymentMode: boolean
    paymentMethods: PaymentMethod[]
    selectedPaymentMethod: string | null
    orderTotal: number
    onSelectMethod: (methodId: string) => void
    onPaymentConfirm: (data: any) => void
    onBackToMethods: () => void
    onViewPaymentDetail: () => void
}

export const PaymentContainer: React.FC<PaymentContainerProps> = ({
    paymentMode,
    paymentMethods,
    selectedPaymentMethod,
    orderTotal,
    onSelectMethod,
    onPaymentConfirm,
    onBackToMethods,
    onViewPaymentDetail,
}) => {
    return (
        <div className="w-full h-full bg-white dark:bg-slate-800 flex flex-col overflow-hidden">
            {paymentMode ? (
                // Modo de Pago: Mostrar Selector o Formulario
                <div className="w-full h-full flex flex-col overflow-hidden">
                    {(() => {
                        const selectedMethod = selectedPaymentMethod 
                            ? paymentMethods.find(m => m.id === selectedPaymentMethod)
                            : null
                        
                        console.log('🔍 Renderizando formulario de pago:', {
                            selectedPaymentMethod,
                            selectedMethod,
                            paymentMethods: paymentMethods.map(m => ({ id: m.id, code: m.code, name: m.name }))
                        })
                        
                        return selectedMethod ? (
                            // Mostrar formulario del método seleccionado
                            <>
                                {selectedMethod.code === 'CASH' && (
                                    <CashPaymentForm
                                        total={orderTotal}
                                        onSubmit={onPaymentConfirm}
                                        onBack={onBackToMethods}
                                    />
                                )}
                                {selectedMethod.code === 'TRANSFER' && (
                                    <TransferPaymentForm
                                        total={orderTotal}
                                        onSubmit={onPaymentConfirm}
                                        onBack={onBackToMethods}
                                    />
                                )}
                                {selectedMethod.code === 'CARD' && (
                                    <CardPaymentForm
                                        total={orderTotal}
                                        onSubmit={onPaymentConfirm}
                                        onBack={onBackToMethods}
                                    />
                                )}
                                {!['CASH', 'TRANSFER', 'CARD'].includes(selectedMethod.code) && (
                                    <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700 gap-3">
                                        <p className="text-slate-600 dark:text-slate-300 font-medium">
                                            Método no soportado: {selectedMethod.name}
                                        </p>
                                        <button
                                            onClick={onBackToMethods}
                                            className="px-4 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg text-sm font-medium transition-all"
                                        >
                                            ← Cambiar método
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Mostrar selector de métodos con botón a detalle
                            <div className="w-full h-full flex flex-col overflow-hidden">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0 flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                                        Métodos de Payment
                                    </h3>
                                    <button
                                        onClick={onViewPaymentDetail}
                                        className="px-3 py-1.5 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition-all"
                                        title="Ver detalle de pago"
                                    >
                                        📋 Detalle
                                    </button>
                                </div>

                                {/* Payment Methods Selector */}
                                <PaymentMethodSelector
                                    methods={paymentMethods}
                                    selectedMethodId={selectedPaymentMethod}
                                    onSelectMethod={onSelectMethod}
                                />
                            </div>
                        )
                    })()}
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-700 gap-3">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                        Selecciona products
                    </p>
                </div>
            )}
        </div>
    )
}

export default PaymentContainer
