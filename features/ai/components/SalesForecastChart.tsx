'use client'
import { useMemo } from 'react'
import { TrendChart, type TrendRow } from '@/components/charts'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { SalesForecast } from '../api'

interface SalesForecastChartProps {
    forecast: SalesForecast | undefined
    loading?: boolean
}

export function SalesForecastChart({ forecast, loading }: SalesForecastChartProps) {
    const data = useMemo<TrendRow[]>(() => {
        if (!forecast) return []
        return forecast.forecast.map((point, index) => ({
            label: `${point.weekday.slice(0, 3)} ${point.date.slice(5)}`,
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
                    <TrendChart
                        exportId="ai-forecast"
                        ariaLabel="Pronóstico de ventas del modelo frente a la referencia"
                        height={300}
                        rows={data}
                        series={[
                            { key: 'model', label: 'Modelo', color: 'var(--chart-1)', kind: 'area', format: 'currency' },
                            { key: 'baseline', label: 'Referencia simple', color: 'var(--chart-2)', kind: 'line', format: 'currency', dashed: true },
                        ]}
                    />
                )}
            </CardContent>
        </Card>
    )
}
