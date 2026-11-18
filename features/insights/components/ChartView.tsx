'use client'
import { useMemo } from 'react'
import { BarListChart, DonutChart, TrendChart, type TrendRow, type TrendSeries } from '@/components/charts'
import type { ChartSpec, ColumnFormat } from '../api'
import { formatCurrency } from '@/lib/utils/currency'

export const CHART_COLORS = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
]

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function formatValue(value: number, format?: ColumnFormat): string {
    switch (format) {
        case 'currency':
            return formatCurrency(value, false)
        case 'percent':
            return `${Math.round(value * 10) / 10} %`
        case 'decimal':
            return value.toLocaleString('es-BO', { maximumFractionDigits: 2 })
        default:
            return Math.round(value).toLocaleString('es-BO')
    }
}

export function formatCategory(value: unknown, kind: ChartSpec['x']['kind']): string {
    const text = String(value ?? '')
    if (kind !== 'time') return text
    const day = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text)
    if (day) return `${Number(day[3])} ${MONTHS[Number(day[2]) - 1]}`
    const month = /^(\d{4})-(\d{2})$/.exec(text)
    if (month) return `${MONTHS[Number(month[2]) - 1]} ${month[1].slice(2)}`
    return text
}

export function ChartView({ spec, height = 280 }: { spec: ChartSpec; height?: number }) {
    const { series, data, x } = spec

    const rows = useMemo<TrendRow[]>(
        () =>
            data.map((row) => {
                const out: TrendRow = { label: formatCategory(row[x.field], x.kind) }
                for (const item of series) {
                    const value = row[item.field]
                    out[item.field] = value === null || value === undefined ? null : Number(value)
                }
                return out
            }),
        [data, series, x],
    )

    if (spec.type === 'pie') {
        const first = series[0]
        return (
            <DonutChart
                ariaLabel={spec.title}
                format={first.format ?? 'integer'}
                height={height}
                data={rows.map((row) => ({ label: row.label, value: Number(row[first.field] ?? 0) }))}
            />
        )
    }

    const horizontal =
        spec.type === 'bar' &&
        series.length === 1 &&
        x.kind === 'category' &&
        (data.length > 6 || data.some((row) => String(row[x.field] ?? '').length > 12))

    if (horizontal) {
        const first = series[0]
        return (
            <BarListChart
                ariaLabel={spec.title}
                format={first.format ?? 'integer'}
                limit={20}
                data={rows.map((row) => ({ label: row.label, value: Number(row[first.field] ?? 0) }))}
            />
        )
    }

    const trendSeries: TrendSeries[] = series.map((item, index) => ({
        key: item.field,
        label: item.label,
        color: CHART_COLORS[index % CHART_COLORS.length],
        kind: spec.type === 'combo' ? item.mark : spec.type === 'line' ? 'line' : spec.type === 'area' ? 'area' : 'bar',
        format: item.format,
        axis: spec.type === 'combo' ? item.axis : 'left',
        dashed: spec.type === 'line' && index > 0,
    }))

    return <TrendChart ariaLabel={spec.title} rows={rows} series={trendSeries} height={height} />
}
