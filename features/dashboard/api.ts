import { apiFetch } from '@/lib/http/client'

export interface DailySalesDto {
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    totalDiscount: number
    totalTips: number
    tableOrders: number
    virtualOrders: number
}

export interface TopProductDto {
    productId: string
    productName: string
    categoryName: string
    quantitySold: number
    unitPrice: number
    totalRevenue: number
}

export interface DailyReportDto {
    date: Date
    sales: DailySalesDto
    topProducts: TopProductDto[]
}

interface ReportEnvelope<T> {
    data?: T
}

export async function getTodaySales(
    signal?: AbortSignal,
): Promise<DailySalesDto> {
    const response = await apiFetch<ReportEnvelope<DailySalesDto>>(
        '/api/reports/today/sales',
        { signal },
    )
    return response.data ?? ({} as DailySalesDto)
}

export async function getTodayTopProducts(
    limit: number = 10,
    signal?: AbortSignal,
): Promise<TopProductDto[]> {
    const response = await apiFetch<ReportEnvelope<TopProductDto[]>>(
        '/api/reports/today/top-products',
        { query: { limit }, signal },
    )
    return response.data ?? []
}

export async function getDailyReport(
    limit: number = 10,
    signal?: AbortSignal,
): Promise<DailyReportDto> {
    const response = await apiFetch<
        ReportEnvelope<{
            date?: string
            sales?: DailySalesDto
            topProducts?: TopProductDto[]
        }>
    >('/api/reports/today', { query: { limit }, signal })

    const data = response.data ?? {}
    return {
        date: new Date(data.date ?? new Date().toISOString()),
        sales: data.sales ?? ({} as DailySalesDto),
        topProducts: data.topProducts ?? [],
    }
}
