'use client'
import { useMemo } from 'react'
import { barY, defineChart } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { compactValue, formatValue, type Slice, type ValueFormat } from './format'

interface ColumnChartProps {
    data: Slice[]
    format?: ValueFormat
    ariaLabel: string
    exportId?: string
    color?: string
    height?: number
}

export function ColumnChart({ data, format = 'currency', ariaLabel, exportId, color = 'var(--primary)', height = 240 }: ColumnChartProps) {
    const definition = useMemo(
        () =>
            defineChart({
                marks: [barY(data, { x: 'label', y: 'value', fill: color, radius: 5 })],
                scales: {
                    x: { scale: () => scaleBand<string>().padding(0.25), axis: { tickLabels: { thin: true } } },
                    y: {
                        scale: scaleLinear,
                        nice: true,
                        grid: true,
                        axis: { ticks: { format: (value: number) => compactValue(value, format) } },
                    },
                },
                tooltip: {
                    use: tooltip,
                    format: (point) => `${String((point.datum as Slice).label)}: ${formatValue(Number(point.yValue), format)}`,
                },
            }),
        [data, color, format],
    )

    if (data.length === 0) {
        return <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar</div>
    }

    return (
        <div data-export-chart={exportId}>
            <Chart definition={definition} height={height} ariaLabel={ariaLabel} />
        </div>
    )
}
