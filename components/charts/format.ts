export type ValueFormat = 'currency' | 'integer' | 'decimal' | 'percent'

export const PALETTE = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']
const OTHERS_COLOR = 'var(--muted-foreground)'

export function formatValue(value: number, format: ValueFormat = 'integer'): string {
    switch (format) {
        case 'currency':
            return `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
        case 'percent':
            return `${value.toLocaleString('es-BO', { maximumFractionDigits: 1 })} %`
        case 'decimal':
            return value.toLocaleString('es-BO', { maximumFractionDigits: 2 })
        default:
            return Math.round(value).toLocaleString('es-BO')
    }
}

export function compactValue(value: number, format: ValueFormat = 'integer'): string {
    const abs = Math.abs(value)
    if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString('es-BO', { maximumFractionDigits: 1 })} M`
    if (abs >= 1000) return `${(value / 1000).toLocaleString('es-BO', { maximumFractionDigits: 1 })} k`
    return formatValue(value, format === 'currency' ? 'decimal' : format)
}

export interface Slice {
    label: string
    value: number
}

export interface PreparedSlice extends Slice {
    share: number
    color: string
}

/** Sorts, keeps the biggest slices and folds the rest into "Otros". */
export function prepareSlices(data: Slice[], maxSlices = 5): PreparedSlice[] {
    const positive = data.filter((item) => item.value > 0).sort((a, b) => b.value - a.value)
    const total = positive.reduce((sum, item) => sum + item.value, 0)
    if (total === 0) return []
    const head = positive.slice(0, maxSlices)
    const rest = positive.slice(maxSlices)
    const items = rest.length > 0 ? [...head, { label: 'Otros', value: rest.reduce((sum, item) => sum + item.value, 0) }] : head
    return items.map((item, index) => ({
        ...item,
        share: (item.value / total) * 100,
        color: item.label === 'Otros' && rest.length > 0 ? OTHERS_COLOR : PALETTE[index % PALETTE.length],
    }))
}

export function donutLegend(data: Slice[], maxSlices = 5) {
    return prepareSlices(data, maxSlices).map((slice) => ({
        label: `${slice.label} · ${formatValue(slice.share, 'percent')}`,
        color: slice.color,
    }))
}
