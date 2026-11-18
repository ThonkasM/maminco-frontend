import type { OrderHistoryEntry } from '@/features/orders/api'
import type { AuditActionGroup } from './api'

export type ActionGroupFilter = AuditActionGroup | ''

export const ACTION_GROUP_OPTIONS: { id: AuditActionGroup; label: string }[] = [
    { id: 'items', label: 'Productos' },
    { id: 'money', label: 'Descuentos y propinas' },
    { id: 'status', label: 'Estado y cocina' },
    { id: 'payments', label: 'Pagos' },
]

const GROUPS: Record<AuditActionGroup, string[]> = {
    items: ['ITEM_ADDED', 'ITEM_REMOVED', 'ITEM_QUANTITY_UPDATED'],
    money: ['DISCOUNT_APPLIED', 'TIP_ADDED'],
    status: ['CREATED', 'STATUS_CHANGED', 'KITCHEN_STATUS_CHANGED'],
    payments: ['PAYMENT'],
}

export function groupOfAction(action: string): AuditActionGroup | null {
    for (const group of Object.keys(GROUPS) as AuditActionGroup[]) {
        if (GROUPS[group].includes(action)) return group
    }
    return null
}

export const ACTION_LABELS: Record<string, string> = {
    CREATED: 'Creó la orden',
    ITEM_ADDED: 'Agregó productos',
    ITEM_REMOVED: 'Quitó productos',
    ITEM_QUANTITY_UPDATED: 'Cambió cantidades',
    DISCOUNT_APPLIED: 'Aplicó descuentos',
    TIP_ADDED: 'Registró propinas',
    STATUS_CHANGED: 'Cambió el estado',
    KITCHEN_STATUS_CHANGED: 'Cambió el estado de cocina',
    PAYMENT: 'Registró pagos',
}

export interface UserActivity {
    id: string
    name: string
    total: number
    byAction: { action: string; label: string; count: number }[]
    firstAt: string
    lastAt: string
}

/** "Quién hizo qué": the history of one order grouped by person, most active first. */
export function groupHistoryByUser(entries: Pick<OrderHistoryEntry, 'action' | 'createdAt' | 'user'>[]): UserActivity[] {
    const users = new Map<string, UserActivity>()
    for (const entry of entries) {
        const current =
            users.get(entry.user.id) ?? { id: entry.user.id, name: entry.user.name, total: 0, byAction: [], firstAt: entry.createdAt, lastAt: entry.createdAt }
        current.total += 1
        const existing = current.byAction.find((item) => item.action === entry.action)
        if (existing) existing.count += 1
        else current.byAction.push({ action: entry.action, label: ACTION_LABELS[entry.action] ?? entry.action, count: 1 })
        if (entry.createdAt < current.firstAt) current.firstAt = entry.createdAt
        if (entry.createdAt > current.lastAt) current.lastAt = entry.createdAt
        users.set(entry.user.id, current)
    }
    return [...users.values()]
        .map((user) => ({ ...user, byAction: user.byAction.sort((a, b) => b.count - a.count) }))
        .sort((a, b) => b.total - a.total)
}

export function changesLabel(count: number): string {
    return `${count} cambio${count === 1 ? '' : 's'}`
}

export const STATUS_LABELS: Record<string, string> = { DRAFT: 'Abierta', CLOSED: 'Cerrada', CANCELLED: 'Cancelada' }
