'use client'
import { useMemo } from 'react'
import { BarChart3 } from 'lucide-react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
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
    Skeleton,
} from '@/components/ui'
import type { TopProductDto } from '../api'

interface TopProductsBarChartProps {
    data: TopProductDto[]
    loading?: boolean
}

export function TopProductsBarChart({
    data,
    loading = false,
}: TopProductsBarChartProps) {
    const chartData = useMemo(() => {
        return data.slice(0, 10).map((product) => ({
            name: product.productName,
            revenue: Number(product.totalRevenue),
            quantity: product.quantitySold,
        }))
    }, [data])

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="size-5 text-muted-foreground" />
                    Productos más vendidos por ingresos
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-80 w-full" />
                ) : chartData.length === 0 ? (
                    <div className="flex h-80 items-center justify-center">
                        <p className="text-sm text-muted-foreground">
                            No hay datos disponibles
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={380}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 20,
                                right: 30,
                                left: 0,
                                bottom: 60,
                            }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="var(--border)"
                            />
                            <XAxis
                                dataKey="name"
                                angle={-45}
                                textAnchor="end"
                                height={100}
                                tick={{
                                    fontSize: 12,
                                    fill: 'var(--muted-foreground)',
                                }}
                            />
                            <YAxis
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
                                formatter={(value: number) =>
                                    `Bs. ${value.toLocaleString()}`
                                }
                            />
                            <Legend
                                wrapperStyle={{
                                    color: 'var(--muted-foreground)',
                                }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="var(--primary)"
                                name="Ingresos (Bs.)"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
