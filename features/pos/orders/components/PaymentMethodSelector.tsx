'use client'

import React from 'react'
import { Banknote, Building2, CreditCard } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

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
            return <Banknote className="size-6" />
        case 'TRANSFER':
            return <Building2 className="size-6" />
        case 'CARD':
            return <CreditCard className="size-6" />
        default:
            return <CreditCard className="size-6" />
    }
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
    methods,
    selectedMethodId,
    onSelectMethod,
    loading = false,
}) => {
    const activePaymentMethods = methods.filter((method) => method.isActive)

    return (
        <div className="flex h-full flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-surface-muted p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Métodos de pago
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    {activePaymentMethods.length} disponible
                    {activePaymentMethods.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
                {activePaymentMethods.length === 0 ? (
                    <EmptyState
                        icon={<CreditCard />}
                        title="Sin métodos disponibles"
                        description="Activa métodos en el panel de gestión."
                    />
                ) : (
                    activePaymentMethods.map((method) => (
                        <Button
                            key={method.id}
                            variant={
                                selectedMethodId === method.id
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => !loading && onSelectMethod(method.id)}
                            disabled={loading}
                            className="h-auto w-full justify-start gap-3 p-4"
                        >
                            {getPaymentIcon(method.code)}
                            <span className="text-sm font-semibold">
                                {method.name}
                            </span>
                        </Button>
                    ))
                )}
            </div>
        </div>
    )
}

export default PaymentMethodSelector
