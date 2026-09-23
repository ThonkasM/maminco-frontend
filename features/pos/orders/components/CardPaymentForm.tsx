'use client'

import React, { useState } from 'react'
import { CreditCard, Delete } from 'lucide-react'
import { Button } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface CardPaymentFormProps {
    total: number
    onSubmit?: (data: { method: string; amount: number; last4: string }) => void
    onBack?: () => void
}

const BUTTON_GRID = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0', '.', 'back'],
]

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
    total,
    onSubmit,
    onBack,
}) => {
    const [amountPaid, setAmountPaid] = useState('')

    const paidAmount = parseFloat(amountPaid) || 0
    const canConfirm = paidAmount > 0

    const handleDigitClick = (digit: string) => {
        if (digit === 'back') {
            setAmountPaid((prev) => prev.slice(0, -1))
            return
        }
        if (digit === '.') {
            setAmountPaid((prev) => (prev.includes('.') ? prev : prev + '.'))
            return
        }
        setAmountPaid((prev) => prev + digit)
    }

    return (
        <div className="flex h-full flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-primary p-4 text-primary-foreground">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-white/20">
                        <CreditCard className="size-6" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wide">
                            Pago con tarjeta
                        </h3>
                        <p className="text-xs opacity-90">
                            Ingresa el monto que está pagando
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="rounded-lg border-2 border-border bg-surface-muted p-4">
                    <p className="mb-1 text-xs text-muted-foreground">
                        Monto ingresado:
                    </p>
                    <p className="min-h-10 font-mono text-3xl font-bold text-foreground">
                        {amountPaid ? formatCurrency(Number(amountPaid)) : '—'}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Total a cobrar: {formatCurrency(total)}
                    </p>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Monto pagado
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                        {BUTTON_GRID.flat().map((button) => (
                            <Button
                                key={button}
                                variant={button === 'back' ? 'danger' : 'secondary'}
                                className="h-14 text-base font-bold"
                                onClick={() => handleDigitClick(button)}
                            >
                                {button === 'back' ? <Delete /> : button}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="shrink-0 space-y-2 border-t border-border bg-surface p-4">
                <Button
                    className="w-full"
                    disabled={!canConfirm}
                    onClick={() =>
                        onSubmit?.({
                            method: 'CARD',
                            amount: paidAmount,
                            last4: '****',
                        })
                    }
                >
                    Registrar pago con tarjeta
                </Button>
                <Button variant="secondary" className="w-full" onClick={onBack}>
                    Volver al detalle
                </Button>
            </div>
        </div>
    )
}

export default CardPaymentForm
