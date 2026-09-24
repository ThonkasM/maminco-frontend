'use client'
import { BarChart3 } from 'lucide-react'
import {
    Bar,
    CartesianGrid,
    ComposedChart,
    Legend,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { TimeSeriesPoint } from '../api'

type TrendGroupBy = 'day' | 'week' | 'month'

const GROUP_OPTIONS: { id: TrendGroupBy; label: string }[] = [
    { id: 'day', label: 'Día' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
]

interface SalesTrendChartProps {
    data: TimeSeriesPoint[]
    loading: boolean
    error: string | null
    groupBy: TrendGroupBy
    onGroupByChange: (groupBy: TrendGroupBy) => void
}

export function SalesTrendChart({
    data,
    loading,
    error,
    groupBy,
    onGroupByChange,
}: SalesTrendChartProps) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="size-5 text-muted-foreground" />
                    Tendencia de ventas
                </CardTitle>
                <div className="flex items-center gap-2">
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
                    <ResponsiveContainer width="100%" height={340}>
                        <ComposedChart
                            data={data}
                            margin={{
                                top: 20,
                                right: 20,
                                left: 0,
                                bottom: 20,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey="period"
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)',
                                }}
                            />
                            <YAxis
                                yAxisId="sales"
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)',
                                }}
                            />
                            <YAxis
                                yAxisId="orders"
                                orientation="right"
                                allowDecimals={false}
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)',
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--foreground)',
                                }}
                                formatter={(value, name) =>
                                    name === 'Órdenes'
                                        ? [String(value), name]
                                        : [formatCurrency(Number(value)), name]
                                }
                            />
                            <Legend
                                wrapperStyle={{
                                    color: 'var(--muted-foreground)',
                                }}
                            />
                            <Bar
                                yAxisId="sales"
                                dataKey="totalSales"
                                name="Ventas (Bs.)"
                                fill="var(--primary)"
                                radius={[8, 8, 0, 0]}
                            />
                            <Line
                                yAxisId="orders"
                                type="monotone"
                                dataKey="totalOrders"
                                name="Órdenes"
                                stroke="var(--accent)"
                                strokeWidth={2}
                                dot={false}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
