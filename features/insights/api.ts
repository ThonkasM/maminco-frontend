import { apiFetch } from '@/lib/http/client'

export type ChartType = 'line' | 'area' | 'bar' | 'pie' | 'combo'
export type ColumnFormat = 'currency' | 'integer' | 'percent' | 'decimal'
export type Cell = string | number | null

export interface DatasetColumn {
    name: string
    label: string
    kind: 'time' | 'category' | 'number' | 'text'
    format?: ColumnFormat
}

export interface Dataset {
    id: string
    title: string
    columns: DatasetColumn[]
    rows: Record<string, Cell>[]
}

export interface ChartSeries {
    field: string
    label: string
    format?: ColumnFormat
    mark: 'bar' | 'line' | 'area'
    axis: 'left' | 'right'
}

export interface ChartSpec {
    id: string
    type: ChartType
    title: string
    x: { field: string; label: string; kind: DatasetColumn['kind'] }
    series: ChartSeries[]
    data: Record<string, Cell>[]
    note?: string
}

export interface AskResult {
    question: string
    answer: string
    charts: ChartSpec[]
    datasets: Dataset[]
    followUps: string[]
    toolsUsed: string[]
    range: { from: string; to: string; label: string }
    engine: { id: string; model: string }
    steps: number
    ms: number
}

export type AlertSeverity = 'info' | 'warning' | 'critical'

export interface InsightAlert {
    id: string
    severity: AlertSeverity
    title: string
    detail: string
}

export interface MonitoringReport {
    alerts: InsightAlert[]
    summary: string
    generatedAt: string
    engine: { id: string; model: string }
}

export interface EngineStatus {
    id: string
    label: string
    model: string
    external: boolean
    available: boolean
    circuitOpen: boolean
}

export interface EnginesResponse {
    engines: EngineStatus[]
    active: EngineStatus | null
}

export type VoiceStatus = 'done' | 'needs_confirmation' | 'clarify' | 'error'

export interface VoiceAction {
    tool: string
    summary: string
    ok: boolean
}

export interface VoiceResult {
    status: VoiceStatus
    message: string
    actions: VoiceAction[]
    tableNumbers: number[]
    confirmation?: { token: string; summaries: string[] }
    engine: { id: string; model: string }
}

export function askInsights(
    body: { question: string; from?: string; to?: string; areaId?: string },
    signal?: AbortSignal,
) {
    return apiFetch<AskResult>('/api/insights/ask', {
        method: 'POST',
        body,
        signal,
    })
}

export function getAlerts(refresh = false, signal?: AbortSignal) {
    return apiFetch<MonitoringReport>('/api/insights/alerts', {
        query: refresh ? { refresh: 1 } : undefined,
        signal,
    })
}

export function getEngines(signal?: AbortSignal) {
    return apiFetch<EnginesResponse>('/api/insights/engines', { signal })
}

export function sendVoiceCommand(
    body: { transcript: string; tableNumber?: number; areaId?: string },
    signal?: AbortSignal,
) {
    return apiFetch<VoiceResult>('/api/insights/voice', {
        method: 'POST',
        body,
        signal,
    })
}

export function confirmVoiceCommand(token: string, signal?: AbortSignal) {
    return apiFetch<VoiceResult>('/api/insights/voice/confirm', {
        method: 'POST',
        body: { token },
        signal,
    })
}
