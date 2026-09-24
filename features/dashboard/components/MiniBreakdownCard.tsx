'use client'
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { getErrorMessage } from '@/lib/utils/errors'
import { useReportBreakdown } from '@/features/reports/hooks/useReports'
import type { BreakdownDimension } from '@/features/reports/api'

interface MiniBreakdownCardProps {
    title: string
    dimension: BreakdownDimension
}

export function MiniBreakdownCard({ title, dimension }: MiniBreakdownCardProps) {
    const breakdown = useReportBreakdown({}, dimension, 8)
    const items = breakdown.data ?? []

    const chartData = items.map((item) => ({
        label: item.label,
        totalSales: Number(item.totalSales),
    }))

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {breakdown.error ? (
                    <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                        {getErrorMessage(
                            breakdown.error,
                            'Error al cargar el desglose',
                        )}
                    </div>
                ) : breakdown.isLoading ? (
                    <Skeleton className="h-64 w-full" />
                ) : chartData.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                        Sin datos para mostrar
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={256}>
                        <BarChart
                            layout="vertical"
                            data={chartData}
                            margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
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
                                width={110}
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
                )}
            </CardContent>
        </Card>
    )
}
