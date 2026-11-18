import { apiFetch, ApiError } from '@/lib/http/client'

export interface ClosureSummary {
    id: string
    businessDate: string
    totalSales: number
    totalOrders: number
    early: boolean
    regeneratedCount: number
    documentId: string | null
    closedAt: string
}

export interface ClosureStatus {
    currentBusinessDate: string
    pending: string[]
    lastClosure: ClosureSummary | null
}

export interface RunClosureInput {
    date: string
    acknowledgeEarly?: boolean
    acknowledgeOpenOrders?: boolean
}

export type ClosureBlock = { code: 'DAY_NOT_FINISHED'; message: string } | { code: 'OPEN_ORDERS'; message: string; openOrders: number }

export const getClosureStatus = (signal?: AbortSignal) => apiFetch<ClosureStatus>('/api/closures/status', { signal })
export const listClosures = (signal?: AbortSignal) => apiFetch<ClosureSummary[]>('/api/closures', { signal })
export const runClosure = (body: RunClosureInput) => apiFetch<ClosureSummary>('/api/closures/run', { method: 'POST', body })

/** The server answers 409 with a `code` when running the closure needs an explicit acknowledgement. */
export function closureBlock(error: unknown): ClosureBlock | null {
    if (!(error instanceof ApiError) || error.status !== 409) return null
    const body = error.body as { code?: string; message?: string; openOrders?: number } | null
    if (body?.code === 'DAY_NOT_FINISHED') return { code: 'DAY_NOT_FINISHED', message: body.message ?? error.message }
    if (body?.code === 'OPEN_ORDERS') return { code: 'OPEN_ORDERS', message: body.message ?? error.message, openOrders: body.openOrders ?? 0 }
    return null
}

export function formatBusinessDate(date: string): string {
    const [year, month, day] = date.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 12)).toLocaleDateString('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    })
}
