import { apiFetch } from '@/lib/http/client'

export interface AiHealth {
    status: string
}

export interface TopProduct {
    name: string
    quantity: number
}

export interface MetricsSummary {
    insufficient_data: boolean
    reason: string | null
    days: number | null
    first_date: string | null
    last_date: string | null
    total_sales: number | null
    total_orders: number | null
    average_daily_sales: number | null
    average_order_value: number | null
    last_refresh: string | null
    products_fitted: number | null
    sales_model_chosen: string | null
    sales_model_mae: number | null
    baseline_mae: number | null
    top_products: TopProduct[]
    generated_at: string | null
}

export interface SalesForecastPoint {
    date: string
    predicted_sales: number
    weekday: string
}

export interface SalesForecast {
    insufficient_data: boolean
    reason: string | null
    horizon: number
    model_mae: number | null
    baseline_mae: number | null
    mape: number | null
    chosen: string | null
    history_days: number | null
    last_history_date: string | null
    forecast: SalesForecastPoint[]
    model_forecast: number[]
    baseline_forecast: number[]
    generated_at: string | null
}

export interface PeakHourPoint {
    hour: number
    avg_orders: number
    avg_sales: number
    order_share: number
    sales_share: number
}

export interface PeakHours {
    insufficient_data: boolean
    reason: string | null
    days_observed: number | null
    peak_hour: number | null
    peak_avg_orders: number | null
    top_hours: number[]
    profile: PeakHourPoint[]
    generated_at: string | null
}

export interface AnomalyPoint {
    date: string
    value: number
    z_score: number
    direction: string
    methods: string[]
}

export interface Anomalies {
    insufficient_data: boolean
    reason: string | null
    method: string | null
    median: number | null
    iqr_lower: number | null
    iqr_upper: number | null
    count: number
    anomalies: AnomalyPoint[]
    generated_at: string | null
}

export interface ProductForecastPoint {
    product_id: string
    product_name: string
    category_name: string | null
    predicted_quantity: number
    average_daily_quantity: number
    chosen: string
    daily: number[]
    dates: string[]
}

export interface ProductForecast {
    insufficient_data: boolean
    reason: string | null
    horizon: number
    forecast: ProductForecastPoint[]
    generated_at: string | null
}

export interface TrainResult {
    ok: boolean
    message: string
    refresh_count: number
    history_days: number
    products_fitted: number
    sales_model_chosen: string | null
    sales_model_mae: number | null
    baseline_mae: number | null
    error: string | null
    generated_at: string | null
}

export function getAiHealth(signal?: AbortSignal): Promise<AiHealth> {
    return apiFetch('/api/ai/health', { signal })
}

export function getMetricsSummary(signal?: AbortSignal): Promise<MetricsSummary> {
    return apiFetch('/api/ai/metrics/summary', { signal })
}

export function getSalesForecast(
    horizon = 7,
    signal?: AbortSignal,
): Promise<SalesForecast> {
    return apiFetch('/api/ai/forecast/sales', { query: { horizon }, signal })
}

export function getProductForecast(
    horizon = 7,
    limit = 10,
    signal?: AbortSignal,
): Promise<ProductForecast> {
    return apiFetch('/api/ai/forecast/products', {
        query: { horizon, limit },
        signal,
    })
}

export function getPeakHours(signal?: AbortSignal): Promise<PeakHours> {
    return apiFetch('/api/ai/forecast/peak-hours', { signal })
}

export function getAnomalies(signal?: AbortSignal): Promise<Anomalies> {
    return apiFetch('/api/ai/insights/anomalies', { signal })
}

export function trainModels(): Promise<TrainResult> {
    return apiFetch('/api/ai/train', { method: 'POST' })
}
