import { apiFetch } from '@/lib/http/client'

export type AuditActionGroup = 'items' | 'money' | 'status' | 'payments'

export interface AuditUserChanges {
    id: string
    name: string
    changes: number
}

export interface AuditOrder {
    id: string
    orderNumber: string
    status: 'DRAFT' | 'CLOSED' | 'CANCELLED'
    tableName: string
    areaName: string | null
    total: number
    createdAt: string
    closedAt: string | null
    createdByName: string
    changeCount: number
    lastChangeAt: string | null
    lastChangeBy: string | null
    users: AuditUserChanges[]
}

export interface PaginatedAuditOrders {
    data: AuditOrder[]
    total: number
    page: number
    limit: number
    totalPages: number
    from: string
    to: string
}

export interface AuditQuery {
    page: number
    limit?: number
    from?: string
    to?: string
    userId?: string
    status?: string
    search?: string
    actionGroup?: AuditActionGroup
}

export const getAuditOrders = (query: AuditQuery, signal?: AbortSignal) =>
    apiFetch<PaginatedAuditOrders>('/api/orders/audit', { query: { limit: 20, ...query }, signal })
