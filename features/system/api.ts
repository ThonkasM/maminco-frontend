import { apiFetch } from '@/lib/http/client'

export type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal'

export interface ServiceHealth {
    reachable: boolean
    latencyMs?: number | null
    url?: string
    detail?: Record<string, unknown>
}

export interface PrintingHealth extends ServiceHealth {
    detail?: { printers: string[]; defaultPrinter: string | null }
}

export interface SystemStatus {
    server: {
        status: string
        startedAt: string
        uptimeSeconds: number
        nodeVersion: string
        environment: string
        memory: { rssMb: number; heapUsedMb: number }
    }
    database: ServiceHealth
    ai: ServiceHealth
    printing: PrintingHealth
    realtime: { clients: number }
    timestamp: string
}

export interface LogEntry {
    timestamp: string
    level: LogLevel
    message: string
    context?: string
}

export interface SystemConfig {
    environment: string
    port: number
    apiBasePath: string
    corsOrigins: string[]
    aiServiceUrl: string | null
    aiEnabled: boolean
    startedAt: string
}

export function getSystemStatus(signal?: AbortSignal): Promise<SystemStatus> {
    return apiFetch('/api/system/status', { signal })
}

export function getSystemLogs(
    limit = 100,
    level?: LogLevel,
    signal?: AbortSignal,
): Promise<{ data: LogEntry[] }> {
    return apiFetch('/api/system/logs', { query: { limit, level }, signal })
}

export function getSystemConfig(signal?: AbortSignal): Promise<SystemConfig> {
    return apiFetch('/api/system/config', { signal })
}
