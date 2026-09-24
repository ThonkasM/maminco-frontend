'use client'

import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertCircle, Banknote, Coins } from 'lucide-react'
import { Button, EmptyState, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { roundMoney } from '@/lib/utils/money'
import { listCashDenominations } from '@/features/payments/api'

export interface CashDenomination {
    id: string
    value: number
    type: 'COIN' | 'BILL'
    quantity: number
    isActive: boolean
}

interface CashPaymentFormProps {
    total: number
    onSubmit?: (data: {
        method: string
        amount: number
    denominations: { id: string; value: number }[]
    }) => void
    onBack?: () => void
}

interface DenominationSectionProps {
    title: string
    icon: React.ReactNode
    denominations: { id: string; value: number }[]
    onAdd: (value: number) => void
}

const formatDenominationValue = (value: number): string =>
    new Intl.NumberFormat('es-BO', {
        minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
        maximumFractionDigits: 2,
    }).format(value)

const DenominationSection: React.FC<DenominationSectionProps> = ({
    title,
    icon,
    denominations,
    onAdd,
}) => {
    if (denominations.length === 0) {
        return null
    }

    return (
        <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
                {icon}
                {title}
            </h4>
            <div className="grid grid-cols-3 gap-2">
                {denominations.map((denomination) => (
                    <Button
                        key={denomination.id}
                        variant="secondary"
                        onClick={() => onAdd(denomination.value)}
                        className="aspect-square h-auto flex-col"
                        title={`Agregar Bs ${denomination.value}`}
                    >
                        <span className="text-lg font-bold">
                            {formatDenominationValue(denomination.value)}
                        </span>
                    </Button>
                ))}
            </div>
        </div>
    )
}

export const CashPaymentForm: React.FC<CashPaymentFormProps> = ({
    total,
    onSubmit,
    onBack,
}) => {
    const [receivedAmount, setReceivedAmount] = useState<number>(0)

    const {
        data: denominations = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ['pos', 'cash-denominations'],
        queryFn: ({ signal }) => listCashDenominations(true, signal),
    })

    const activeDenominations = denominations.filter((denomination) => denomination.isActive)
    const billDenoms = activeDenominations.filter((denomination) => denomination.type === 'BILL')
    const coinDenoms = activeDenominations.filter((denomination) => denomination.type === 'COIN')

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-surface-muted p-4">
                <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Banknote className="size-6" />
                    </div>
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                        Pago en efectivo
                    </h3>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-4">
                <div className="rounded-lg border border-border bg-surface-muted p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Total a cobrar
                    </p>
                    <p className="text-4xl font-extrabold font-mono text-primary">
                        {formatCurrency(total)}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-3 border-t border-border pt-3">
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Monto recibido
                            </p>
                            <p className="text-xl font-bold font-mono text-foreground">
                                {receivedAmount > 0
                                    ? formatCurrency(receivedAmount)
                                    : '—'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                Cambio
                            </p>
                            <p className="text-xl font-bold font-mono text-success">
                                {formatCurrency(
                                    Math.max(0, receivedAmount - total),
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/10 p-3">
                        <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" />
                        <p className="text-sm text-danger">
                            Error cargando denominaciones
                        </p>
                    </div>
                )}

                {isLoading ? (
                    <div className="space-y-3">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                ) : activeDenominations.length === 0 ? (
                    <EmptyState
                        icon={<Banknote />}
                        title="Sin denominaciones"
                        description="Configura denominaciones en el panel de gestión."
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        <DenominationSection
                            title="Billetes"
                            icon={<Banknote className="size-4" />}
                            denominations={billDenoms}
                            onAdd={(value) =>
                                setReceivedAmount((prev) =>
                                    roundMoney(prev + value),
                                )
                            }
                        />
                        <DenominationSection
                            title="Monedas"
                            icon={<Coins className="size-4" />}
                            denominations={coinDenoms}
                            onAdd={(value) =>
                                setReceivedAmount((prev) =>
                                    roundMoney(prev + value),
                                )
                            }
                        />
                    </div>
                )}
            </div>

            <div className="shrink-0 space-y-2 border-t border-border bg-surface p-4">
                <Button
                    className="w-full"
                    disabled={receivedAmount <= 0 || isLoading}
                    onClick={() =>
                        onSubmit?.({
                            method: 'CASH',
                            amount: receivedAmount,
                            denominations: [],
                        })
                    }
                >
                    Registrar pago en efectivo
                </Button>
                <Button variant="secondary" className="w-full" onClick={onBack}>
                    Volver al detalle
                </Button>
            </div>
        </div>
    )
}

export default CashPaymentForm
