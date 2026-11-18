import { describe, expect, it } from 'vitest'
import { shiftLength, shiftOfHour, shiftOfMinute, toMinutes, toTime, validateShifts } from '@/features/shifts/lib'

const day = { name: 'Día', start: '06:00', end: '18:00' }
const night = { name: 'Noche', start: '18:00', end: '06:00' }

describe('shift helpers', () => {
    it('converts between HH:MM and minutes', () => {
        expect(toMinutes('06:30')).toBe(390)
        expect(toMinutes('24:00')).toBeNull()
        expect(toTime(390)).toBe('06:30')
        expect(toTime(-60)).toBe('23:00')
    })

    it('measures shifts that cross midnight', () => {
        expect(shiftLength(day)).toBe(720)
        expect(shiftLength(night)).toBe(720)
    })

    it('accepts day and night shifts that cover 24 h', () => {
        expect(validateShifts([day, night])).toBeNull()
    })

    it('rejects gaps, overlaps and bad input', () => {
        expect(validateShifts([day, { name: 'Noche', start: '19:00', end: '06:00' }])).toMatch(/24 horas/)
        expect(validateShifts([day, { name: 'Noche', start: '17:00', end: '06:00' }])).toMatch(/superponen/)
        expect(validateShifts([day, { name: 'día', start: '18:00', end: '06:00' }])).toMatch(/repetirse/)
        expect(validateShifts([{ name: '', start: '00:00', end: '00:00' }])).toMatch(/nombre/)
        expect(validateShifts([])).toMatch(/al menos/)
    })

    it('accepts a single shift covering the whole day', () => {
        expect(validateShifts([{ name: 'Todo el día', start: '00:00', end: '00:00' }])).toBeNull()
    })

    it('finds the shift of a time of day', () => {
        expect(shiftOfMinute([day, night], 12 * 60)?.name).toBe('Día')
        expect(shiftOfMinute([day, night], 2 * 60)?.name).toBe('Noche')
        expect(shiftOfHour([day, night], 17)?.name).toBe('Día')
        expect(shiftOfHour([day, night], 18)?.name).toBe('Noche')
    })
})
