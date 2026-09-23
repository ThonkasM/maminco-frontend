'use client'
import { useEffect, useMemo, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
    Select,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface DiscountModalProps {
    isOpen: boolean
    totalAmount: number
    onSubmit: (
        type: 'percentage' | 'fixed',
        amount: number,
        reason: string,
    ) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

const REASONS = [
    'Cortesía',
    'Promoción',
    'Cliente Especial',
    'Error de Precio',
    'Compensación',
    'Otra',
]

export function DiscountModal({
    isOpen,
    totalAmount,
    onSubmit,
    onClose,
    isLoading,
}: DiscountModalProps) {
    const [type, setType] = useState<'percentage' | 'fixed'>('percentage')
    const [amount, setAmount] = useState(0)
    const [reason, setReason] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setType('percentage')
        setAmount(0)
        setReason('')
    }, [isOpen])

    const discountPreview = useMemo(() => {
        if (type === 'percentage') {
            const discountAmount = (totalAmount * amount) / 100
            return {
                display: `${amount}%`,
                finalTotal: totalAmount - discountAmount,
            }
        }
        return {
            display: formatCurrency(amount),
            finalTotal: totalAmount - amount,
        }
    }, [type, amount, totalAmount])

    const isValid =
        amount > 0 &&
        (type === 'fixed' ? amount <= totalAmount : amount <= 100)
    const loading = submitting || isLoading

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!isValid) return

        setSubmitting(true)
        try {
            await onSubmit(type, amount, reason)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Aplicar descuento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <span className="text-sm font-medium text-foreground">
                            Tipo de descuento
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={
                                    type === 'percentage'
                                        ? 'primary'
                                        : 'secondary'
                                }
                                onClick={() => setType('percentage')}
                                disabled={loading}
                            >
                                Porcentaje (%)
                            </Button>
                            <Button
                                type="button"
                                variant={
                                    type === 'fixed' ? 'primary' : 'secondary'
                                }
                                onClick={() => setType('fixed')}
                                disabled={loading}
                            >
                                Monto fijo
                            </Button>
                        </div>
                    </div>

                    <FormField
                        label={`Monto (${type === 'percentage' ? '%' : 'Bs.'})`}
                        description={
                            type === 'percentage'
                                ? 'Máximo: 100%'
                                : `Máximo: ${formatCurrency(totalAmount)}`
                        }
                        required
                    >
                        <Input
                            type="number"
                            min="0"
                            max={type === 'percentage' ? 100 : totalAmount}
                            value={amount}
                            onChange={(e) =>
                                setAmount(
                                    Math.max(
                                        0,
                                        parseInt(e.target.value) || 0,
                                    ),
                                )
                            }
                            disabled={loading}
                            placeholder={
                                type === 'percentage' ? 'Ej: 10' : 'Ej: 50000'
                            }
                        />
                    </FormField>

                    <FormField label="Razón" description="Opcional">
                        <Select
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Selecciona una razón...</option>
                            {REASONS.map((option) => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    {amount > 0 && (
                        <div className="space-y-2 rounded-lg bg-surface-muted p-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Total original
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatCurrency(totalAmount)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-danger">Descuento</span>
                                <span className="font-medium text-danger">
                                    -{discountPreview.display}
                                </span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="font-semibold text-foreground">
                                    Total final
                                </span>
                                <span className="font-bold text-foreground">
                                    {formatCurrency(
                                        discountPreview.finalTotal,
                                    )}
                                </span>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={!isValid || loading}>
                            {submitting ? 'Aplicando...' : 'Aplicar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
