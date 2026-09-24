export const BUSINESS_TIMEZONE = 'America/La_Paz'

export type ReportPresetId =
    | 'today'
    | 'yesterday'
    | 'thisWeek'
    | 'thisMonth'
    | 'lastMonth'
    | 'custom'

export interface DateRange {
    from: string
    to: string
}

export const REPORT_PRESETS: { id: ReportPresetId; label: string }[] = [
    { id: 'today', label: 'Hoy' },
    { id: 'yesterday', label: 'Ayer' },
    { id: 'thisWeek', label: 'Esta semana' },
    { id: 'thisMonth', label: 'Este mes' },
    { id: 'lastMonth', label: 'Mes anterior' },
    { id: 'custom', label: 'Personalizado' },
]

export function todayInBusinessTz(): string {
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: BUSINESS_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    }).format(new Date())
}

function parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day))
}

function formatIsoDate(date: Date): string {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

export function addDays(iso: string, days: number): string {
    const date = parseIsoDate(iso)
    date.setUTCDate(date.getUTCDate() + days)
    return formatIsoDate(date)
}

export function addMonths(iso: string, months: number): string {
    const date = parseIsoDate(iso)
    const day = date.getUTCDate()
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + months)
    const lastDay = new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0),
    ).getUTCDate()
    date.setUTCDate(Math.min(day, lastDay))
    return formatIsoDate(date)
}

export function startOfWeek(iso: string): string {
    const date = parseIsoDate(iso)
    const offset = (date.getUTCDay() + 6) % 7
    return addDays(iso, -offset)
}

export function startOfMonth(iso: string): string {
    const date = parseIsoDate(iso)
    date.setUTCDate(1)
    return formatIsoDate(date)
}

export function endOfMonth(iso: string): string {
    const date = parseIsoDate(iso)
    date.setUTCDate(1)
    date.setUTCMonth(date.getUTCMonth() + 1)
    date.setUTCDate(0)
    return formatIsoDate(date)
}

export function diffDays(from: string, to: string): number {
    const start = parseIsoDate(from).getTime()
    const end = parseIsoDate(to).getTime()
    return Math.round((end - start) / 86400000)
}

export function buildPresetRange(
    preset: ReportPresetId,
    today: string = todayInBusinessTz(),
): DateRange {
    switch (preset) {
        case 'yesterday': {
            const day = addDays(today, -1)
            return { from: day, to: day }
        }
        case 'thisWeek':
            return { from: startOfWeek(today), to: today }
        case 'thisMonth':
            return { from: startOfMonth(today), to: endOfMonth(today) }
        case 'lastMonth': {
            const previous = addMonths(today, -1)
            return {
                from: startOfMonth(previous),
                to: endOfMonth(previous),
            }
        }
        case 'today':
        case 'custom':
        default:
            return { from: today, to: today }
    }
}
