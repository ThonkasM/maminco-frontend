'use client'
import { useMemo, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { HeatmapCell } from '../api'

const DAYS = [
    { weekday: 1, label: 'Lun' },
    { weekday: 2, label: 'Mar' },
    { weekday: 3, label: 'Mié' },
    { weekday: 4, label: 'Jue' },
    { weekday: 5, label: 'Vie' },
    { weekday: 6, label: 'Sáb' },
    { weekday: 0, label: 'Dom' },
]

type Metric = 'totalSales' | 'totalOrders'

interface SalesHeatmapProps {
    data: HeatmapCell[]
    loading: boolean
}

export function SalesHeatmap({ data, loading }: SalesHeatmapProps) {
    const [metric, setMetric] = useState<Metric>('totalSales')

    const view = useMemo(() => {
        if (data.length === 0) return null
        const hours = data.map((cell) => cell.hour)
        const first = Math.min(...hours)
        const last = Math.max(...hours)
        const grid = new Map(data.map((cell) => [`${cell.weekday}-${cell.hour}`, cell]))
        const max = Math.max(...data.map((cell) => cell[metric]))
        const top = [...data].sort((a, b) => b[metric] - a[metric]).slice(0, 3)
        return { first, last, grid, max, top }
    }, [data, metric])

    const format = (value: number) =>
        metric === 'totalSales' ? formatCurrency(value, false) : `${value.toLocaleString('es-BO')} órdenes`

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="size-5 text-muted-foreground" />
                    Horas y días de mayor demanda
                </CardTitle>
                <div className="flex gap-1">
                    {(
                        [
                            ['totalSales', 'Ventas'],
                            ['totalOrders', 'Órdenes'],
                        ] as [Metric, string][]
                    ).map(([id, label]) => (
                        <Button key={id} size="sm" variant={metric === id ? 'primary' : 'ghost'} onClick={() => setMetric(id)}>
                            {label}
                        </Button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-64 w-full" />
                ) : !view ? (
                    <EmptyState icon={<CalendarClock />} title="Sin datos" description="No hay ventas para analizar horarios en este rango." />
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Mejores franjas:{' '}
                            {view.top.map((cell, index) => (
                                <span key={`${cell.weekday}-${cell.hour}`} className="text-foreground">
                                    {index > 0 && ' · '}
                                    <strong>
                                        {DAYS.find((d) => d.weekday === cell.weekday)?.label} {String(cell.hour).padStart(2, '0')}:00
                                    </strong>{' '}
                                    ({format(cell[metric])})
                                </span>
                            ))}
                        </p>
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[34rem] border-separate border-spacing-1 text-xs">
                                <thead>
                                    <tr>
                                        <th className="w-10" />
                                        {Array.from({ length: view.last - view.first + 1 }, (_, i) => view.first + i).map((hour) => (
                                            <th key={hour} className="font-medium text-muted-foreground">
                                                {String(hour).padStart(2, '0')}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {DAYS.map((day) => (
                                        <tr key={day.weekday}>
                                            <th scope="row" className="pr-2 text-right font-medium text-muted-foreground">
                                                {day.label}
                                            </th>
                                            {Array.from({ length: view.last - view.first + 1 }, (_, i) => view.first + i).map((hour) => {
                                                const cell = view.grid.get(`${day.weekday}-${hour}`)
                                                const value = cell?.[metric] ?? 0
                                                const intensity = view.max > 0 ? value / view.max : 0
                                                return (
                                                    <td
                                                        key={hour}
                                                        title={`${day.label} ${String(hour).padStart(2, '0')}:00 · ${format(value)}`}
                                                        className="h-8 rounded-sm text-center"
                                                        style={{
                                                            backgroundColor:
                                                                value > 0
                                                                    ? `color-mix(in oklab, var(--chart-1) ${Math.round(12 + intensity * 78)}%, transparent)`
                                                                    : 'var(--surface-muted)',
                                                        }}
                                                    >
                                                        <span className="sr-only">{format(value)}</span>
                                                    </td>
                                                )
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            Menos
                            <span
                                className="h-2 w-28 rounded-full"
                                style={{ background: 'linear-gradient(90deg, color-mix(in oklab, var(--chart-1) 12%, transparent), var(--chart-1))' }}
                                aria-hidden="true"
                            />
                            Más
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
