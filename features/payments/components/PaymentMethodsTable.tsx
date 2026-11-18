'use client'

import { paymentMethodLabel } from '@/lib/utils/paymentMethod'
import { Banknote, CreditCard } from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import type { PaymentMethodDto } from '../api'

interface PaymentMethodsTableProps {
    methods: PaymentMethodDto[]
    loading: boolean
    error: string | null
    onToggle: (id: string, currentStatus: boolean) => Promise<void>
}

export function PaymentMethodsTable({
    methods,
    loading,
    error,
    onToggle,
}: PaymentMethodsTableProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                    Métodos de pago
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestiona los métodos de pago disponibles. Fueron creados en
                    el seed inicial.
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                </div>
            ) : methods.length === 0 ? (
                <EmptyState
                    icon={<CreditCard />}
                    title="No hay métodos de pago"
                    description="Ejecuta el seed para crear los métodos de pago del sistema."
                />
            ) : (
                <div className="space-y-3">
                    {methods.map((method) => {
                        const isCash = method.code === 'CASH'
                        return (
                            <Card key={method.id}>
                                <CardContent className="flex items-center justify-between gap-4 p-4">
                                    <div className="flex flex-1 items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-muted text-muted-foreground">
                                            {isCash ? (
                                                <Banknote className="size-5" />
                                            ) : (
                                                <CreditCard className="size-5" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-medium text-foreground">
                                                    {paymentMethodLabel(method.code, method.name)}
                                                </h3>
                                                <code className="rounded bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                    {method.code}
                                                </code>
                                                {isCash && (
                                                    <Badge variant="info">
                                                        Configurable
                                                    </Badge>
                                                )}
                                            </div>
                                            {method.description && (
                                                <p className="mt-1 text-sm text-muted-foreground">
                                                    {method.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Badge
                                            variant={
                                                method.isActive
                                                    ? 'success'
                                                    : 'danger'
                                            }
                                        >
                                            {method.isActive
                                                ? 'Activo'
                                                : 'Inactivo'}
                                        </Badge>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                void onToggle(
                                                    method.id,
                                                    method.isActive,
                                                )
                                            }
                                        >
                                            {method.isActive
                                                ? 'Desactivar'
                                                : 'Activar'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}

            {methods.length > 0 && (
                <div className="rounded-lg border border-border bg-surface-muted/40 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Nota:</strong> Los
                    métodos de pago se crean en el seed inicial. Aquí solo puedes
                    activarlos o desactivarlos. Para efectivo, ve a la sección de
                    denominaciones de efectivo para configurar monedas y
                    billetes.
                </div>
            )}
        </div>
    )
}
