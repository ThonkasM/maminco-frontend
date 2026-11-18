'use client'
import { useMemo } from 'react'
import { defineChart } from '@tanstack/charts'
import { pie, polar, radialArc } from '@tanstack/charts/polar'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { cn } from '@/lib/utils/cn'
import { formatValue, prepareSlices, type Slice, type ValueFormat } from './format'

interface DonutChartProps {
    data: Slice[]
    format?: ValueFormat
    ariaLabel: string
    /** Used to find the chart when exporting reports. */
    exportId?: string
    height?: number
    maxSlices?: number
    centerLabel?: string
    /** Legend below the ring instead of beside it (narrow cards). */
    stacked?: boolean
    className?: string
}

export function DonutChart({
    data,
    format = 'currency',
    ariaLabel,
    exportId,
    height = 200,
    maxSlices = 5,
    centerLabel = 'Total',
    stacked = false,
    className,
}: DonutChartProps) {
    const slices = useMemo(() => prepareSlices(data, maxSlices), [data, maxSlices])
    const total = slices.reduce((sum, slice) => sum + slice.value, 0)

    const definition = useMemo(() => {
        const arcs = pie(slices, { value: 'value' })
        return defineChart({
            marks: [
                polar({
                    inset: 6,
                    radiusRatio: 0.92,
                    marks: [
                        radialArc(arcs, {
                            innerRadius: ({ radius }) => radius * 0.62,
                            cornerRadius: 4,
                            color: 'label',
                            key: 'label',
                        }),
                    ],
                    scales: { angle: null, radius: null },
                }),
            ],
            scales: { x: null, y: null },
            color: { domain: slices.map((slice) => slice.label), range: slices.map((slice) => slice.color) },
            tooltip: {
                use: tooltip,
                format: (point) => {
                    const slice = point.datum as { label: string; value: number; share: number }
                    return `${slice.label}: ${formatValue(slice.value, format)} (${formatValue(slice.share, 'percent')})`
                },
            },
        })
    }, [slices, format])

    if (slices.length === 0) {
        return (
            <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Sin datos para mostrar</div>
        )
    }

    return (
        <div className={cn('flex flex-col items-center gap-4', !stacked && 'sm:flex-row', className)}>
            <div data-export-chart={exportId} className="relative w-full max-w-[220px] shrink-0">
                <Chart definition={definition} height={height} ariaLabel={ariaLabel} />
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{centerLabel}</span>
                    <span className="text-base font-semibold text-foreground">{formatValue(total, format)}</span>
                </div>
            </div>
            <ul className="w-full min-w-0 flex-1 space-y-1.5 text-sm">
                {slices.map((slice) => (
                    <li key={slice.label} className="flex items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-sm" style={{ background: slice.color }} aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate text-foreground">{slice.label}</span>
                        <span className="tabular-nums text-muted-foreground">{formatValue(slice.share, 'percent')}</span>
                        <span className="w-20 shrink-0 text-right font-medium tabular-nums text-foreground">
                            {formatValue(slice.value, format)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
