'use client'

import React from 'react'
import { AlertTriangle, ArrowLeft, Check, RefreshCw } from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'

interface RegisteredPayment {
    methodName: string
    methodCode: string
    amount: number
}

interface PaymentDetailViewProps {
    subtotal: number
    registeredPayments: RegisteredPayment[]
    change: number
    totalPaid: number
    onBack: () => void
    onAddPayment: () => void
    onFinalize: () => void
}

export const PaymentDetailView: React.FC<PaymentDetailViewProps> = ({
    subtotal,
    registeredPayments,
    change,
    totalPaid,
    onBack,
}) => {
    const changeState =
        change > 0
            ? { variant: 'info' as const, label: 'Cambio a dar', icon: RefreshCw }
            : change === 0
              ? { variant: 'success' as const, label: 'Monto exacto', icon: Check }
              : { variant: 'danger' as const, label: 'Falta pagar', icon: AlertTriangle }

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-surface">
            <div className="shrink-0 border-b border-border bg-surface-muted p-4">
                <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                    Detalle de pago
                </h3>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Pagos registrados
                    </p>
                    {registeredPayments.length > 0 ? (
                        <div className="space-y-2">
                            {registeredPayments.map((payment, index) => (
                                <Card
                                    key={`${payment.methodCode}-${index}`}
                                    className="flex items-center justify-between p-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="size-2 rounded-full bg-success" />
                                        <span className="font-semibold text-foreground">
                                            {payment.methodName}
                                        </span>
                                    </div>
                                    <span className="text-lg font-bold text-success">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                </Card>
                            ))}
                            <Card className="flex items-center justify-between bg-surface-muted p-4">
                                <span className="font-bold text-foreground">
                                    Total pagado:
                                </span>
                                <span className="text-xl font-bold text-foreground">
                                    {formatCurrency(totalPaid)}
                                </span>
                            </Card>
                        </div>
                    ) : (
                        <Card className="bg-surface-muted p-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                No hay pagos registrados aún
                            </p>
                        </Card>
                    )}
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                        Subtotal a pagar
                    </p>
                    <Card className="bg-surface-muted p-4">
                        <p className="text-right text-2xl font-bold text-foreground">
                            {formatCurrency(subtotal)}
                        </p>
                    </Card>
                </div>

                {totalPaid > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                            Estado del cambio
                        </p>
                        <Card className="flex items-center justify-between p-4">
                            <Badge variant={changeState.variant}>
                                <changeState.icon className="size-3.5" />
                                {changeState.label}
                            </Badge>
                            <span className="text-2xl font-bold text-foreground">
                                {formatCurrency(Math.abs(change))}
                            </span>
                        </Card>
                    </div>
                )}
            </div>

            <div className="shrink-0 border-t border-border bg-surface p-4">
                <Button variant="secondary" className="w-full" onClick={onBack}>
                    <ArrowLeft />
                    Volver
                </Button>
            </div>
        </div>
    )
}

export default PaymentDetailView
