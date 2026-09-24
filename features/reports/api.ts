import { apiFetch } from '@/lib/http/client'

export interface ReportRangeParams {
    from?: string
    to?: string
    areaId?: string
    tableId?: string
}

export interface ReportSummary {
    from: string
    to: string
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    totalDiscount: number
    totalTips: number
    mesaOrders: number
    virtualOrders: number
    totalItems: number
    averageItemsPerOrder: number
}

export interface TimeSeriesPoint {
    period: string
    totalSales: number
    totalOrders: number
}

export const BREAKDOWN_DIMENSIONS = [
    'area',
    'table',
    'category',
    'paymentMethod',
    'hour',
    'waiter',
] as const

export type BreakdownDimension = (typeof BREAKDOWN_DIMENSIONS)[number]

export interface BreakdownItem {
    key: string
    label: string
    totalSales: number
    totalOrders: number
    quantity?: number
}

export interface ReportTopProduct {
    productId: string
    productName: string
    categoryName: string
    quantitySold: number
    unitPrice: number
    totalRevenue: number
}

interface Envelope<T> {
    data: T
}

export function getReportSummary(
    params: ReportRangeParams,
    signal?: AbortSignal,
): Promise<ReportSummary> {
    return apiFetch<Envelope<ReportSummary>>('/api/reports/summary', {
        query: { ...params },
        signal,
    }).then((r) => r.data)
}

export function getReportTimeSeries(
    params: ReportRangeParams & { groupBy?: 'day' | 'week' | 'month' },
    signal?: AbortSignal,
): Promise<TimeSeriesPoint[]> {
    return apiFetch<Envelope<TimeSeriesPoint[]>>('/api/reports/timeseries', {
        query: { ...params },
        signal,
    }).then((r) => r.data)
}

export function getReportBreakdown(
    params: ReportRangeParams & { by: BreakdownDimension; limit?: number },
    signal?: AbortSignal,
): Promise<BreakdownItem[]> {
    return apiFetch<Envelope<BreakdownItem[]>>('/api/reports/breakdown', {
        query: { ...params },
        signal,
    }).then((r) => r.data)
}

export function getReportTopProducts(
    params: ReportRangeParams & { limit?: number },
    signal?: AbortSignal,
): Promise<ReportTopProduct[]> {
    return apiFetch<Envelope<ReportTopProduct[]>>('/api/reports/top-products', {
        query: { ...params },
        signal,
    }).then((r) => r.data)
}
