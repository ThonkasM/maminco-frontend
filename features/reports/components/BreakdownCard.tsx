'use client'
import { PieChart } from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
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
]

interface BreakdownCardProps {
    dimension: BreakdownDimension
    onDimensionChange: (dimension: BreakdownDimension) => void
    items: BreakdownItem[]
    loading: boolean
    error: string | null
}

export function BreakdownCard({
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
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart
                                layout="vertical"
                                data={chartData}
                                margin={{
                                    top: 8,
                                    right: 24,
                                    left: 8,
                                    bottom: 8,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    stroke="var(--border)"
                                    horizontal={false}
                                />
                                <XAxis
                                    type="number"
                                    tick={{
                                        fontSize: 12,
                                        fill: 'var(--muted-foreground)',
                                    }}
                                />
                                <YAxis
                                    type="category"
                                    dataKey="label"
                                    width={120}
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
                                    formatter={(value) =>
                                        formatCurrency(Number(value))
                                    }
                                />
                                <Bar
                                    dataKey="totalSales"
                                    name="Ventas (Bs.)"
                                    fill="var(--primary)"
                                    radius={[0, 8, 8, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>

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
