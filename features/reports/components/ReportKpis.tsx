'use client'
import {
    BarChart3,
    CalendarDays,
    ClipboardList,
    DollarSign,
    HandCoins,
    Package,
    Percent,
    TrendingDown,
    TrendingUp,
} from 'lucide-react'
import { Card, CardContent, EmptyState, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/currency'
import type { ComparedMetric, ReportComparison, ReportSummary } from '../api'

interface ReportKpisProps {
    summary?: ReportSummary
    comparison?: ReportComparison
    days: number
    loading: boolean
    error: string | null
}

function DeltaBadge({
    value,
    inverse = false,
}: {
    value: number | null | undefined
    inverse?: boolean
}) {
    if (value === null || value === undefined) return null
    const up = value >= 0
    const good = inverse ? !up : up
    const Icon = up ? TrendingUp : TrendingDown
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                value === 0
                    ? 'bg-surface-muted text-muted-foreground'
                    : good
                      ? 'bg-success-fill/15 text-success'
                      : 'bg-danger-fill/15 text-danger',
            )}
            title="Variación frente al periodo anterior de igual duración"
        >
            <Icon className="size-3" aria-hidden="true" />
            {up ? '+' : ''}
            {value.toLocaleString('es-BO', { maximumFractionDigits: 1 })} %
        </span>
    )
}

interface KpiCard {
    label: string
    value: string
    sub?: string
    icon: typeof BarChart3
    iconClass: string
    metric?: ComparedMetric
    inverse?: boolean
}

export function ReportKpis({ summary, comparison, days, loading, error }: ReportKpisProps) {
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
                    <Skeleton key={index} className="h-28 w-full" />
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

    const gross = summary.totalSales + summary.totalDiscount
    const share = (amount: number, base: number) =>
        base > 0 ? `${((amount / base) * 100).toFixed(1)} % de la venta` : undefined
    const dailyAverage = summary.totalSales / Math.max(days, 1)

    const cards: KpiCard[] = [
        { label: 'Ventas', value: formatCurrency(summary.totalSales), icon: DollarSign, iconClass: 'text-success', metric: 'totalSales' },
        {
            label: 'Órdenes',
            value: summary.totalOrders.toLocaleString('es-BO'),
            sub: `${summary.tableOrders.toLocaleString('es-BO')} en mesa · ${summary.virtualOrders.toLocaleString('es-BO')} virtuales`,
            icon: ClipboardList,
            iconClass: 'text-primary-ink',
            metric: 'totalOrders',
        },
        { label: 'Ticket promedio', value: formatCurrency(summary.averageOrderValue), icon: BarChart3, iconClass: 'text-warning', metric: 'averageOrderValue' },
        { label: 'Ítems por pedido', value: summary.averageItemsPerOrder.toFixed(1), icon: Package, iconClass: 'text-foreground' },
        {
            label: 'Descuentos',
            value: formatCurrency(summary.totalDiscount),
            sub: share(summary.totalDiscount, gross),
            icon: Percent,
            iconClass: 'text-warning',
            metric: 'totalDiscount',
            inverse: true,
        },
        {
            label: 'Propinas',
            value: formatCurrency(summary.totalTips),
            sub: share(summary.totalTips, summary.totalSales),
            icon: HandCoins,
            iconClass: 'text-success',
            metric: 'totalTips',
        },
        {
            label: 'Venta diaria promedio',
            value: formatCurrency(dailyAverage),
            sub: `${days} día${days === 1 ? '' : 's'} en el rango`,
            icon: CalendarDays,
            iconClass: 'text-primary-ink',
        },
        {
            label: 'Periodo anterior',
            value: comparison ? formatCurrency(comparison.previous.totalSales) : '—',
            sub: comparison ? `${comparison.previous.totalOrders.toLocaleString('es-BO')} órdenes` : undefined,
            icon: TrendingUp,
            iconClass: 'text-muted-foreground',
        },
    ]

    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {cards.map((card) => {
                const Icon = card.icon
                return (
                    <Card key={card.label}>
                        <CardContent className="p-4">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <div className="flex size-9 items-center justify-center rounded-lg bg-surface-muted">
                                    <Icon className={`size-4 ${card.iconClass}`} />
                                </div>
                                {card.metric && (
                                    <DeltaBadge value={comparison?.deltas[card.metric]} inverse={card.inverse} />
                                )}
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                {card.label}
                            </p>
                            <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{card.value}</p>
                            {card.sub && <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>}
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
