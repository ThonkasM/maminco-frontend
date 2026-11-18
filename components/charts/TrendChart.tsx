'use client'
import { useMemo } from 'react'
import { areaY, barY, defineChart, lineY } from '@tanstack/charts'
import { scaleBand } from '@tanstack/charts/scales/band'
import { scaleLinear } from '@tanstack/charts/scales/linear'
import { scalePoint } from '@tanstack/charts/scales/point'
import { tooltip } from '@tanstack/charts/tooltip'
import { Chart } from '@tanstack/charts/react'
import { compactValue, formatValue, type ValueFormat } from './format'

export interface TrendSeries {
    key: string
    label: string
    color: string
    kind: 'bar' | 'line' | 'area'
    format?: ValueFormat
    axis?: 'left' | 'right'
    dashed?: boolean
}

export type TrendRow = { label: string } & Record<string, string | number | null>

interface TrendChartProps {
    rows: TrendRow[]
    series: TrendSeries[]
    ariaLabel: string
    exportId?: string
    height?: number
}

export function TrendChart({ rows, series, ariaLabel, exportId, height = 300 }: TrendChartProps) {
    const definition = useMemo(() => {
        const hasBars = series.some((item) => item.kind === 'bar')
        const secondary = series.find((item) => item.axis === 'right')
        const left = series.find((item) => item.axis !== 'right')
        const marks = series.map((item) => {
            const common = {
                id: item.key,
                x: 'label' as const,
                y: (row: TrendRow) => (row[item.key] ?? null) as number | null,
                yScale: item.axis === 'right' ? 'right' : undefined,
            }
            if (item.kind === 'bar') return barY(rows, { ...common, fill: item.color, radius: 4 })
            if (item.kind === 'area') return areaY(rows, { ...common, fill: item.color, stroke: item.color, strokeWidth: 2, fillOpacity: 0.18 })
            return lineY(rows, {
                ...common,
                stroke: item.color,
                strokeWidth: 2.25,
                strokeDasharray: item.dashed ? '5 4' : undefined,
            })
        })

        const scales: Record<string, unknown> = {
            x: {
                scale: hasBars ? () => scaleBand<string>().padding(0.25) : () => scalePoint<string>().padding(0.3),
                axis: { tickLabels: { thin: true } },
            },
            y: {
                scale: scaleLinear,
                nice: true,
                grid: true,
                axis: { ticks: { format: (value: number) => compactValue(value, left?.format) } },
            },
        }
        if (secondary) {
            scales.right = {
                channel: 'y',
                side: 'right',
                scale: scaleLinear,
                nice: true,
                axis: { ticks: { format: (value: number) => compactValue(value, secondary.format) } },
            }
        }

        return defineChart({
            marks,
            scales,
            focus: 'group-x',
            tooltip: {
                use: tooltip,
                formatGroup: (points: readonly { markId: string; yValue: unknown; datum: unknown }[]) => {
                    const first = points[0]
                    const title = first ? String((first.datum as { label: string }).label) : ''
                    const lines = points.map((point) => {
                        const item = series.find((entry) => entry.key === point.markId) ?? series[0]
                        return `${item.label}: ${formatValue(Number(point.yValue), item.format)}`
                    })
                    return [title, ...lines].join(' · ')
                },
            },
        } as never)
    }, [rows, series])

    return (
        <div>
            <div data-export-chart={exportId}>
                <Chart definition={definition as never} height={height} ariaLabel={ariaLabel} />
            </div>
            {series.length > 1 && (
                <ul className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {series.map((item) => (
                        <li key={item.key} className="flex items-center gap-1.5">
                            <span
                                className="h-2.5 w-2.5 rounded-sm"
                                style={{ background: item.color, opacity: item.dashed ? 0.7 : 1 }}
                                aria-hidden="true"
                            />
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
