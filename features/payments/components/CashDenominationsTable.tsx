'use client'
import { Banknote, Coins, Trash2 } from 'lucide-react'
import {
    Button,
    Card,
    CardContent,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import type { CashDenominationDto } from '../api'
import { formatCurrency } from '@/lib/utils/currency'

interface CashDenominationsTableProps {
    denominations: CashDenominationDto[]
    loading: boolean
    error: string | null
    onDelete: (denomination: CashDenominationDto) => void
}

function DenominationGroup({
    title,
    icon,
    items,
    onDelete,
}: {
    title: string
    icon: React.ReactNode
    items: CashDenominationDto[]
    onDelete: (denomination: CashDenominationDto) => void
}) {
    if (items.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                No hay {title.toLowerCase()}
            </p>
        )
    }

    return (
        <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                {icon}
                {title}
            </h3>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {items.map((denomination) => (
                    <Card key={denomination.id}>
                        <CardContent className="flex flex-col items-center gap-1 p-4">
                            <p className="text-2xl font-bold text-foreground">
                                {formatCurrency(denomination.value)}
                            </p>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                {denomination.type === 'COIN'
                                    ? 'Moneda'
                                    : 'Billete'}
                            </p>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-danger hover:bg-danger/10"
                                onClick={() => onDelete(denomination)}
                            >
                                <Trash2 />
                                Eliminar
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}

export function CashDenominationsTable({
    denominations,
    loading,
    error,
    onDelete,
}: CashDenominationsTableProps) {
    const coins = denominations
        .filter((d) => d.type === 'COIN')
        .sort((a, b) => Number(a.value) - Number(b.value))
    const bills = denominations
        .filter((d) => d.type === 'BILL')
        .sort((a, b) => Number(a.value) - Number(b.value))

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                    Denominaciones de efectivo
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Gestiona las monedas y billetes disponibles en caja
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
            ) : denominations.length === 0 ? (
                <EmptyState
                    icon={<Coins />}
                    title="No hay denominaciones"
                    description="Crea una para comenzar a configurar el efectivo en caja."
                />
            ) : (
                <div className="space-y-8">
                    <DenominationGroup
                        title="Monedas"
                        icon={<Coins className="size-4" />}
                        items={coins}
                        onDelete={onDelete}
                    />
                    <DenominationGroup
                        title="Billetes"
                        icon={<Banknote className="size-4" />}
                        items={bills}
                        onDelete={onDelete}
                    />
                </div>
            )}

            {denominations.length > 0 && (
                <div className="rounded-lg border border-border bg-surface-muted/40 p-4 text-sm text-muted-foreground">
                    <strong className="text-foreground">Nota:</strong> Las
                    denominaciones que agregues aquí aparecerán en el panel de
                    caja para facilitar el conteo de efectivo.
                </div>
            )}
        </div>
    )
}
