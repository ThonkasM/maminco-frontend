'use client'

import React from 'react'
import { Check, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui'
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
        <div className="shrink-0 space-y-3 border-t border-border bg-surface p-4">
            <div className="flex justify-between border-b border-border pb-3 text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-lg font-bold text-foreground">
                    {formatCurrency(subtotal)}
                </span>
            </div>

            <Button
                variant="danger"
                className="w-full"
                onClick={onCancelOrder}
                title="Cancelar la orden y volver a mesas"
            >
                <X />
                Cancelar orden
            </Button>

            {paymentMode ? (
                <Button
                    className="w-full"
                    onClick={onFinalizePayment}
                    disabled={totalPaid < subtotal}
                    title={
                        totalPaid >= subtotal
                            ? 'Finalizar y cerrar la orden'
                            : `Falta ${formatCurrency(subtotal - totalPaid)}`
                    }
                >
                    {totalPaid >= subtotal ? <Check /> : <CreditCard />}
                    {totalPaid >= subtotal ? 'Finalizar' : 'Agregando pago'}
                </Button>
            ) : (
                <Button
                    className="w-full"
                    onClick={onStartPayment}
                    title="Registrar pagos y cerrar la orden"
                >
                    <CreditCard />
                    Cerrar y cobrar
                </Button>
            )}

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
