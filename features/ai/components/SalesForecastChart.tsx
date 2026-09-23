'use client'
import { useMemo } from 'react'
import {
    Area,
    AreaChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { SalesForecast } from '../api'

interface SalesForecastChartProps {
    forecast: SalesForecast | undefined
    loading?: boolean
}

export function SalesForecastChart({ forecast, loading }: SalesForecastChartProps) {
    const data = useMemo(() => {
        if (!forecast) return []
        return forecast.forecast.map((point, index) => ({
            date: point.date.slice(5),
            weekday: point.weekday,
            model: forecast.model_forecast[index] ?? point.predicted_sales,
            baseline: forecast.baseline_forecast[index] ?? null,
        }))
    }, [forecast])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Pronóstico de ventas</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Modelo vs. referencia (baseline) para los próximos días
                </p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-72 w-full" />
                ) : data.length === 0 ? (
                    <div className="flex h-72 items-center justify-center text-sm text-muted-foreground">
                        Sin datos de pronóstico
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="date"
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                width={60}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--foreground)',
                                }}
                                formatter={(value: number, name: string) => [
                                    formatCurrency(Number(value)),
                                    name === 'model' ? 'Modelo' : 'Baseline',
                                ]}
                            />
                            <Legend
                                formatter={(value) => (value === 'model' ? 'Modelo' : 'Baseline')}
                                wrapperStyle={{ color: 'var(--muted-foreground)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="model"
                                stroke="var(--primary)"
                                strokeWidth={2}
                                fill="url(#forecastFill)"
                            />
                            <Area
                                type="monotone"
                                dataKey="baseline"
                                stroke="var(--accent)"
                                strokeDasharray="5 5"
                                fill="none"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
