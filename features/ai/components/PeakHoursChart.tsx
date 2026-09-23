'use client'
import { useMemo } from 'react'
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
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                            <XAxis
                                dataKey="hour"
                                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                            />
                            <YAxis
                                tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
                                width={40}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    color: 'var(--foreground)',
                                }}
                                formatter={(value: number) => [`${value} órdenes`, 'Promedio']}
                            />
                            <Bar dataKey="orders" fill="var(--primary)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    )
}
