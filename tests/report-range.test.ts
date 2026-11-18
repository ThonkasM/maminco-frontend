import { describe, expect, it } from 'vitest'
import {
    addDays,
    addMonths,
    buildPresetRange,
    diffDays,
    endOfMonth,
    startOfMonth,
    startOfWeek,
} from '@/lib/utils/reportRange'

describe('date helpers', () => {
    it('addDays crosses month and year boundaries', () => {
        expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
        expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    })
    it('addMonths clamps the day', () => {
        expect(addMonths('2026-03-31', -1)).toBe('2026-02-28')
        expect(addMonths('2024-03-31', -1)).toBe('2024-02-29')
    })
    it('startOfWeek is Monday', () => {
        expect(startOfWeek('2026-11-15')).toBe('2026-11-09')
        expect(startOfWeek('2026-11-09')).toBe('2026-11-09')
    })
    it('month bounds', () => {
        expect(startOfMonth('2026-02-17')).toBe('2026-02-01')
        expect(endOfMonth('2026-02-17')).toBe('2026-02-28')
    })
    it('diffDays', () => {
        expect(diffDays('2026-01-01', '2026-01-31')).toBe(30)
    })
})

describe('buildPresetRange', () => {
    const today = '2026-11-15'
    it('today / yesterday', () => {
        expect(buildPresetRange('today', today)).toEqual({ from: today, to: today })
        expect(buildPresetRange('yesterday', today)).toEqual({ from: '2026-11-14', to: '2026-11-14' })
    })
    it('thisWeek / thisMonth / lastMonth', () => {
        expect(buildPresetRange('thisWeek', today)).toEqual({ from: '2026-11-09', to: today })
        expect(buildPresetRange('thisMonth', today)).toEqual({ from: '2026-11-01', to: '2026-11-30' })
        expect(buildPresetRange('lastMonth', today)).toEqual({ from: '2026-10-01', to: '2026-10-31' })
    })
})
