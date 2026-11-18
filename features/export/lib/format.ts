import type { ExportCell, ExportColumn, ValueType } from '../model'

const LOCALE = 'es-BO'

export function formatCell(value: ExportCell, type: ValueType): string {
    if (value === null || value === undefined || value === '') return '—'
    if (type === 'text' || typeof value === 'string') return String(value)
    switch (type) {
        case 'currency':
            return `Bs. ${value.toLocaleString(LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        case 'percent':
            return `${value.toLocaleString(LOCALE, { maximumFractionDigits: 1 })} %`
        case 'decimal':
            return value.toLocaleString(LOCALE, { maximumFractionDigits: 2 })
        default:
            return Math.round(value).toLocaleString(LOCALE)
    }
}

export function isNumeric(column: ExportColumn): boolean {
    return column.type !== 'text'
}

export function slug(text: string): string {
    return (
        text
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-zA-Z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .toLowerCase()
            .slice(0, 60) || 'reporte'
    )
}

export function timestampLabel(date = new Date()): string {
    return date.toLocaleString(LOCALE, { dateStyle: 'long', timeStyle: 'short' })
}

export function fileStamp(date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}`
}
