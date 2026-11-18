import { apiFetch } from '@/lib/http/client'

export interface Shift {
    id: string
    name: string
    start: string
    end: string
}

export interface ShiftConfig {
    timeZone?: string
    businessDayStart: string
    shifts: Shift[]
}

export interface ShiftConfigInput {
    businessDayStart: string
    shifts: { name: string; start: string; end: string }[]
}

export const getShiftConfig = (signal?: AbortSignal) => apiFetch<ShiftConfig>('/api/settings/shifts', { signal })
export const updateShiftConfig = (body: ShiftConfigInput) => apiFetch<ShiftConfig>('/api/settings/shifts', { method: 'PUT', body })
