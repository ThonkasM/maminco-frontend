'use client'
import {
    BarChart3,
    ClipboardList,
    DollarSign,
    HandCoins,
    Monitor,
    Package,
    Percent,
    UtensilsCrossed,
} from 'lucide-react'
import { Card, CardContent, EmptyState, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { ReportSummary } from '../api'

interface ReportKpisProps {
    summary?: ReportSummary
    loading: boolean
    error: string | null
}

export function ReportKpis({ summary, loading, error }: ReportKpisProps) {
    if (error) {
        return (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {error}
            </div>
        )
    }

    if (loading || !summary) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    if (summary.totalOrders === 0) {
        return (
            <EmptyState
                icon={<BarChart3 />}
                title="Sin ventas"
                description="No hay ventas registradas en el rango seleccionado."
            />
        )
    }

    const cards = [
        {
            label: 'Ventas',
            value: formatCurrency(summary.totalSales),
            icon: DollarSign,
            className: 'text-success',
        },
        {
            label: 'Órdenes',
            value: summary.totalOrders.toLocaleString(),
            icon: ClipboardList,
            className: 'text-primary',
        },
        {
            label: 'Ticket promedio',
            value: formatCurrency(summary.averageOrderValue),
            icon: BarChart3,
            className: 'text-accent-foreground',
        },
        {
            label: 'Ítems por pedido',
            value: summary.averageItemsPerOrder.toFixed(1),
            icon: Package,
            className: 'text-foreground',
        },
        {
            label: 'Descuentos',
            value: formatCurrency(summary.totalDiscount),
            icon: Percent,
            className: 'text-warning',
        },
        {
            label: 'Propinas',
            value: formatCurrency(summary.totalTips),
            icon: HandCoins,
            className: 'text-success',
        },
        {
            label: 'Mesas',
            value: summary.mesaOrders.toLocaleString(),
            icon: UtensilsCrossed,
            className: 'text-primary',
        },
        {
            label: 'Virtuales',
            value: summary.virtualOrders.toLocaleString(),
            icon: Monitor,
            className: 'text-accent-foreground',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.label}>
                        <CardContent className="p-4">
                            <div className="mb-2 flex size-9 items-center justify-center rounded-lg bg-surface-muted">
                                <Icon className={`size-4 ${card.className}`} />
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {card.label}
                            </p>
                            <p className="mt-1 text-xl font-bold text-foreground">
                                {card.value}
                            </p>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
