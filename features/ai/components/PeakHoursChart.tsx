'use client'
import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import type { PeakHours } from '../api'

interface PeakHoursChartProps {
    peakHours: PeakHours | undefined
    loading?: boolean
}

export function PeakHoursChart({ peakHours, loading }: PeakHoursChartProps) {
    const data = useMemo(
        () =>
            (peakHours?.profile ?? []).map((point) => ({
                hour: `${String(point.hour).padStart(2, '0')}h`,
                orders: Number(point.avg_orders.toFixed(2)),
            })),
        [peakHours],
    )

    const definition = useMemo(
        () =>
            defineChart({
                marks: [
                    barY(data, {
                        x: 'hour',
                        y: 'orders',
                        fill: 'var(--primary)',
                        radius: 6,
                    }),
                ],
                scales: {
                    x: { scale: () => scaleBand<string>().padding(0.25) },
                    y: { scale: scaleLinear, nice: true, grid: true },
                },
                tooltip,
            }),
        [data],
    )

    return (
        <Card>
            <CardHeader>
                <CardTitle>Horas pico</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Promedio de órdenes por hora del día
                </p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : data.length === 0 ? (
                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                        Sin datos de horas pico
                    </div>
                ) : (
                    <div data-export-chart="ai-peak-hours">
                    <Chart
                        definition={definition}
                        height={260}
                        ariaLabel="Promedio de órdenes por hora del día"
                    />
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
