'use client'
import { BarChart3 } from 'lucide-react'
import { TrendChart, type TrendRow } from '@/components/charts'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import type { TimeSeriesPoint } from '../api'

type TrendGroupBy = 'day' | 'week' | 'month'

const GROUP_OPTIONS: { id: TrendGroupBy; label: string }[] = [
    { id: 'day', label: 'Día' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
]

interface SalesTrendChartProps {
    data: TimeSeriesPoint[]
    previous?: TimeSeriesPoint[]
    compare: boolean
    onCompareChange: (value: boolean) => void
    loading: boolean
    error: string | null
    groupBy: TrendGroupBy
    onGroupByChange: (groupBy: TrendGroupBy) => void
}

export function SalesTrendChart({
    data,
    previous,
    compare,
    onCompareChange,
    loading,
    error,
    groupBy,
    onGroupByChange,
}: SalesTrendChartProps) {
    const merged: TrendRow[] = data.map((point, index) => ({
        label: point.period,
        totalSales: point.totalSales,
        totalOrders: point.totalOrders,
        previousSales: compare ? (previous?.[index]?.totalSales ?? null) : null,
    }))

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="size-5 text-muted-foreground" />
                    Tendencia de ventas
                </CardTitle>
                <div className="flex items-center gap-2">
                    <label className="mr-2 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
                        <input
                            type="checkbox"
                            checked={compare}
                            onChange={(event) => onCompareChange(event.target.checked)}
                            className="size-3.5 accent-[var(--primary)]"
                        />
                        Comparar con el periodo anterior
                    </label>
                    <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                        Agrupar
                    </span>
                    <div className="flex gap-1">
                        {GROUP_OPTIONS.map((option) => (
                            <Button
                                key={option.id}
                                variant={
                                    groupBy === option.id ? 'primary' : 'ghost'
                                }
                                size="sm"
                                onClick={() => onGroupByChange(option.id)}
                            >
                                {option.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                        {error}
                    </div>
                ) : loading ? (
                    <Skeleton className="h-80 w-full" />
                ) : data.length === 0 ? (
                    <EmptyState
                        icon={<BarChart3 />}
                        title="Sin datos"
                        description="No hay ventas para graficar en el rango seleccionado."
                    />
                ) : (
                    <TrendChart
                        exportId="reports-trend"
                        ariaLabel="Tendencia de ventas y órdenes"
                        height={340}
                        rows={merged}
                        series={[
                            { key: 'totalSales', label: 'Ventas (Bs.)', color: 'var(--chart-1)', kind: 'bar', format: 'currency' },
                            ...(compare
                                ? [{ key: 'previousSales', label: 'Periodo anterior (Bs.)', color: 'var(--chart-3)', kind: 'line' as const, format: 'currency' as const, dashed: true }]
                                : []),
                            { key: 'totalOrders', label: 'Órdenes', color: 'var(--chart-2)', kind: 'line', axis: 'right' },
                        ]}
                    />
                )}
            </CardContent>
        </Card>
    )
}
