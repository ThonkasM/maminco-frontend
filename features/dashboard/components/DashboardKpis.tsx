'use client'
import {
    ClipboardList,
    DollarSign,
    Package,
    TrendingUp,
} from 'lucide-react'
import { Card, CardContent, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { getErrorMessage } from '@/lib/utils/errors'
import { useReportSummary } from '@/features/reports/hooks/useReports'

export function DashboardKpis() {
    const summary = useReportSummary({})

    if (summary.isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    if (summary.error) {
        return (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {getErrorMessage(summary.error, 'Error al cargar indicadores')}
            </div>
        )
    }

    const data = summary.data
    const cards = [
        {
            label: 'Ventas hoy',
            value: formatCurrency(data?.totalSales),
            icon: DollarSign,
            className: 'text-success',
        },
        {
            label: 'Órdenes hoy',
            value: (data?.totalOrders ?? 0).toLocaleString(),
            icon: ClipboardList,
            className: 'text-primary',
        },
        {
            label: 'Ticket promedio',
            value: formatCurrency(data?.averageOrderValue),
            icon: TrendingUp,
            className: 'text-accent-foreground',
        },
        {
            label: 'Ítems por pedido',
            value: (data?.averageItemsPerOrder ?? 0).toFixed(1),
            icon: Package,
            className: 'text-foreground',
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
