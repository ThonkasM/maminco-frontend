'use client'
import { BarChart3, PieChart } from 'lucide-react'
import { BarListChart, DonutChart } from '@/components/charts'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    EmptyState,
    Select,
    Skeleton,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { BreakdownDimension, BreakdownItem } from '../api'

const DIMENSION_OPTIONS: { id: BreakdownDimension; label: string }[] = [
    { id: 'area', label: 'Área' },
    { id: 'table', label: 'Mesa' },
    { id: 'category', label: 'Categoría' },
    { id: 'paymentMethod', label: 'Método de pago' },
    { id: 'hour', label: 'Hora' },
    { id: 'waiter', label: 'Mesero' },
    { id: 'shift', label: 'Turno' },
]

export type BreakdownView = 'bars' | 'donut'

interface BreakdownCardProps {
    view: BreakdownView
    onViewChange: (view: BreakdownView) => void
    dimension: BreakdownDimension
    onDimensionChange: (dimension: BreakdownDimension) => void
    items: BreakdownItem[]
    loading: boolean
    error: string | null
}

export function BreakdownCard({
    view,
    onViewChange,
    dimension,
    onDimensionChange,
    items,
    loading,
    error,
}: BreakdownCardProps) {
    const chartData = items.map((item) => ({
        label: item.label,
        totalSales: Number(item.totalSales),
        totalOrders: item.totalOrders,
    }))

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <PieChart className="size-5 text-muted-foreground" />
                    Desglose
                </CardTitle>
                <div className="flex items-center gap-2">
                    <div className="flex gap-1" role="group" aria-label="Tipo de gráfico">
                        <Button size="sm" variant={view === 'bars' ? 'primary' : 'ghost'} aria-pressed={view === 'bars'} onClick={() => onViewChange('bars')}>
                            <BarChart3 />
                            Barras
                        </Button>
                        <Button size="sm" variant={view === 'donut' ? 'primary' : 'ghost'} aria-pressed={view === 'donut'} onClick={() => onViewChange('donut')}>
                            <PieChart />
                            Circular
                        </Button>
                    </div>
                    <span className="hidden text-xs font-medium uppercase tracking-wide text-muted-foreground sm:inline">
                        Ver por
                    </span>
                    <div className="w-48">
                        <Select
                            value={dimension}
                            onChange={(e) =>
                                onDimensionChange(
                                    e.target.value as BreakdownDimension,
                                )
                            }
                        >
                            {DIMENSION_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {error ? (
                    <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                        {error}
                    </div>
                ) : loading ? (
                    <Skeleton className="h-72 w-full" />
                ) : items.length === 0 ? (
                    <EmptyState
                        icon={<PieChart />}
                        title="Sin datos"
                        description="No hay información para este desglose."
                    />
                ) : (
                    <div className="space-y-4">
                        {view === 'donut' ? (
                            <DonutChart
                                exportId="reports-breakdown"
                                ariaLabel="Composición de las ventas"
                                height={220}
                                data={chartData.map((item) => ({ label: item.label, value: item.totalSales }))}
                            />
                        ) : (
                            <BarListChart
                                exportId="reports-breakdown"
                                ariaLabel="Ventas por dimensión"
                                data={chartData.map((item) => ({ label: item.label, value: item.totalSales }))}
                                limit={12}
                            />
                        )}

                        <div className="space-y-1">
                            {items.map((item) => (
                                <div
                                    key={item.key}
                                    className="flex items-center justify-between gap-4 border-b border-border py-2 text-sm last:border-0"
                                >
                                    <span className="text-foreground">
                                        {item.label}
                                    </span>
                                    <span className="flex items-center gap-4">
                                        <span className="text-muted-foreground">
                                            {item.totalOrders} órdenes
                                        </span>
                                        <span className="font-semibold text-foreground">
                                            {formatCurrency(item.totalSales)}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
