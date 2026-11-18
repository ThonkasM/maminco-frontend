export interface ShiftDraft {
    id?: string
    name: string
    start: string
    end: string
}

export const DAY_MINUTES = 1440

export function toMinutes(value: string): number | null {
    const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim())
    if (!match) return null
    const hours = Number(match[1])
    const minutes = Number(match[2])
    if (hours > 23 || minutes > 59) return null
    return hours * 60 + minutes
}

export function toTime(minutes: number): string {
    const normalized = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES
    return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`
}

/** Minutes a shift lasts; end <= start means it crosses midnight. */
export function shiftLength(shift: ShiftDraft): number | null {
    const start = toMinutes(shift.start)
    const end = toMinutes(shift.end)
    if (start === null || end === null) return null
    return end > start ? end - start : DAY_MINUTES - start + end
}

/** Returns a Spanish message when the shifts do not cover exactly 24 h without overlaps, otherwise null. */
export function validateShifts(shifts: ShiftDraft[]): string | null {
    if (shifts.length === 0) return 'Agrega al menos un turno.'
    const names = new Set<string>()
    for (const shift of shifts) {
        const name = shift.name.trim().toLowerCase()
        if (!name) return 'Todos los turnos necesitan un nombre.'
        if (names.has(name)) return 'Los nombres de los turnos no pueden repetirse.'
        names.add(name)
        if (toMinutes(shift.start) === null || toMinutes(shift.end) === null) return 'Usa horas válidas (HH:MM).'
    }
    const coverage = new Array<number>(DAY_MINUTES).fill(0)
    for (const shift of shifts) {
        const start = toMinutes(shift.start) as number
        const length = shiftLength(shift) as number
        for (let i = 0; i < length; i++) coverage[(start + i) % DAY_MINUTES] += 1
    }
    if (coverage.some((count) => count > 1)) return 'Hay turnos que se superponen.'
    if (coverage.some((count) => count === 0)) return 'Los turnos deben cubrir las 24 horas del día, sin huecos.'
    return null
}

export function shiftOfMinute(shifts: ShiftDraft[], minute: number): ShiftDraft | null {
    for (const shift of shifts) {
        const start = toMinutes(shift.start)
        const length = shiftLength(shift)
        if (start === null || length === null) continue
        const offset = (minute - start + DAY_MINUTES) % DAY_MINUTES
        if (offset < length) return shift
    }
    return null
}

/** Which shift owns each calendar hour (by the minute the hour starts). Used to group hourly profiles. */
export function shiftOfHour(shifts: ShiftDraft[], hour: number): ShiftDraft | null {
    return shiftOfMinute(shifts, hour * 60 + 30)
}
