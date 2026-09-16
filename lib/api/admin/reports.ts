import { API_BASE, getHeaders } from '../../http/client'

/**
 * Report DTOs
 */

export interface DailySalesDto {
    totalSales: number
    totalOrders: number
    averageOrderValue: number
    totalDiscount: number
    totalTips: number
    mesaOrders: number
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

/**
 * Get today's sales
 */
export async function getTodaySales(): Promise<DailySalesDto> {
    const res = await fetch(`${API_BASE}/api/reports/today/sales`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching today sales')
    }

    const response = await res.json()
    return response.data || {}
}

/**
 * Get today's top products
 */
export async function getTodayTopProducts(limit: number = 10): Promise<TopProductDto[]> {
    const params = new URLSearchParams({ limit: String(limit) })

    const res = await fetch(`${API_BASE}/api/reports/today/top-products?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        throw new Error(err.message || 'Error fetching today top products')
    }

    const response = await res.json()
    return response.data || []
}

/**
 * Get complete daily report (sales + top products)
 */
export async function getDailyReport(limit: number = 10): Promise<DailyReportDto> {
    const params = new URLSearchParams({ limit: String(limit) })

    const res = await fetch(`${API_BASE}/api/reports/today?${params}`, {
        method: 'GET',
        headers: getHeaders(),
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }))
        console.error('[getDailyReport] HTTP Error:', res.status, err)
        throw new Error(err.message || 'Error fetching daily report')
    }

    const response = await res.json()
    console.log('[getDailyReport] Raw response:', response)

    const data = response.data || { date: new Date().toISOString(), sales: {}, topProducts: [] }
    console.log('[getDailyReport] Data extracted:', data)

    // Ensure date is properly formatted
    const result = {
        date: new Date(data.date),
        sales: data.sales || {},
        topProducts: data.topProducts || [],
    }

    console.log('[getDailyReport] Final result:', result)
    return result
}
