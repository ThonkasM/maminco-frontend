'use client'
import { useMemo } from 'react'
import { barX, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { compactValue, formatValue, type Slice, type ValueFormat } from './format'

interface BarListChartProps {
    data: Slice[]
    format?: ValueFormat
    ariaLabel: string
    exportId?: string
    color?: string
    /** Rows shown; the rest are dropped. */
    limit?: number
    rowHeight?: number
}

export function BarListChart({ data, format = 'currency', ariaLabel, exportId, color = 'var(--primary)', limit = 10, rowHeight = 34 }: BarListChartProps) {
    const rows = useMemo(() => [...data].sort((a, b) => b.value - a.value).slice(0, limit), [data, limit])

    const definition = useMemo(
        () =>
            defineChart({
                marks: [barX(rows, { x: 'value', y: 'label', fill: color, radius: 5 })],
                scales: {
                    x: {
                        scale: scaleLinear,
                        nice: true,
                        grid: true,
                        axis: { ticks: { format: (value: number) => compactValue(value, format) } },
                    },
                    y: { scale: () => scaleBand<string>().padding(0.25) },
                },
                tooltip: {
                    use: tooltip,
                    format: (point) => `${String((point.datum as Slice).label)}: ${formatValue(Number(point.xValue), format)}`,
                },
            }),
        [rows, color, format],
    )

    if (rows.length === 0) {
        return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar</div>
    }

    return (
        <div data-export-chart={exportId}>
            <Chart definition={definition} height={Math.max(180, rows.length * rowHeight + 40)} ariaLabel={ariaLabel} />
        </div>
    )
}
