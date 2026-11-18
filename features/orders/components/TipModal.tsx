'use client'

import { useResetOnChange } from '@/hooks/useResetOnChange'
import { roundMoney } from '@/lib/utils/money'
import { useMemo, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface TipModalProps {
    isOpen: boolean
    totalAmount: number
    onSubmit: (tipAmount: number) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export function TipModal({
    isOpen,
    totalAmount,
    onSubmit,
    onClose,
    isLoading,
}: TipModalProps) {
    const [tipAmount, setTipAmount] = useState(0)
    const [tipPercentage, setTipPercentage] = useState(10)
    const [submitting, setSubmitting] = useState(false)

    useResetOnChange(isOpen, () => {
        setTipAmount(0)
        setTipPercentage(10)
    })

    const totalWithTip = useMemo(
        () => totalAmount + tipAmount,
        [totalAmount, tipAmount],
    )

    const quickTip = (percentage: number) => {
        const calculated = roundMoney((totalAmount * percentage) / 100)
        setTipPercentage(percentage)
        setTipAmount(calculated)
    }

    const loading = submitting || isLoading

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        setSubmitting(true)
        try {
            await onSubmit(tipAmount)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar propina</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="rounded-lg bg-surface-muted p-4">
                        <p className="text-sm text-muted-foreground">
                            Total (sin propina)
                        </p>
                        <p className="text-2xl font-bold text-foreground">
                            {formatCurrency(totalAmount)}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">
                            Propina sugerida
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                            {[5, 10, 15].map((percentage) => (
                                <Button
                                    key={percentage}
                                    type="button"
                                    variant={
                                        tipPercentage === percentage
                                            ? 'primary'
                                            : 'secondary'
                                    }
                                    size="sm"
                                    onClick={() => quickTip(percentage)}
                                    disabled={loading}
                                >
                                    {percentage}%
                                </Button>
                            ))}
                        </div>
                    </div>

                    <FormField label="Monto personalizado">
                        <Input
                            type="number"
                            min="0"
                            value={tipAmount}
                            onChange={(e) => {
                                setTipAmount(
                                    Math.max(
                                        0,
                                        parseInt(e.target.value) || 0,
                                    ),
                                )
                                setTipPercentage(0)
                            }}
                            disabled={loading}
                            placeholder="Ingresa el monto de la propina"
                        />
                    </FormField>

                    <div className="space-y-2 rounded-lg bg-surface-muted p-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                                Subtotal
                            </span>
                            <span className="font-medium text-foreground">
                                {formatCurrency(totalAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-success">Propina</span>
                            <span className="font-medium text-success">
                                +{formatCurrency(tipAmount)}
                            </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2">
                            <span className="font-semibold text-foreground">
                                Total
                            </span>
                            <span className="font-bold text-foreground">
                                {formatCurrency(totalWithTip)}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {submitting ? 'Agregando...' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
