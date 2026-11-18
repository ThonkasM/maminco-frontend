import { apiFetch } from '@/lib/http/client'
import type { UserRole } from '@/lib/types/enums'

export type NotificationType = 'ANNOUNCEMENT' | 'PRICE_UPDATE' | 'MENU_UPDATE' | 'SYSTEM_ALERT'
export type AutomaticType = Exclude<NotificationType, 'ANNOUNCEMENT'>

export interface InboxItem {
    id: string
    type: NotificationType
    title: string
    body: string
    url: string | null
    createdAt: string
    readAt: string | null
}

export interface Inbox {
    unread: number
    items: InboxItem[]
}

export interface HistoryItem {
    id: string
    type: NotificationType
    title: string
    body: string
    createdAt: string
    createdByName: string | null
    audienceRoles: UserRole[]
    recipients: number
    read: number
}

export interface NotificationRule {
    type: AutomaticType
    enabled: boolean
    audienceRoles: UserRole[]
}

export interface PushConfig {
    webPublicKey: string | null
    channels: ('WEB' | 'EXPO')[]
}

export const getInbox = (signal?: AbortSignal) => apiFetch<Inbox>('/api/notifications/mine', { query: { limit: 30 }, signal })
export const markRead = (id: string) => apiFetch<{ ok: boolean }>(`/api/notifications/${id}/read`, { method: 'POST' })
export const markAllRead = () => apiFetch<{ updated: number }>('/api/notifications/read-all', { method: 'POST' })
export const getPushConfig = (signal?: AbortSignal) => apiFetch<PushConfig>('/api/notifications/push/config', { signal })
export const subscribePush = (body: { kind: 'WEB' | 'EXPO'; endpoint: string; p256dh?: string; auth?: string }) =>
    apiFetch<{ ok: boolean }>('/api/notifications/push/subscriptions', { method: 'POST', body })
export const unsubscribePush = (endpoint: string) =>
    apiFetch<{ ok: boolean }>('/api/notifications/push/subscriptions', { method: 'DELETE', body: { endpoint } })
export const sendNotification = (body: { title: string; body: string; roles?: UserRole[]; userIds?: string[] }) =>
    apiFetch<{ id: string; recipients: number }>('/api/notifications', { method: 'POST', body })
export const getHistory = (signal?: AbortSignal) => apiFetch<HistoryItem[]>('/api/notifications/history', { signal })
export const getRules = (signal?: AbortSignal) => apiFetch<NotificationRule[]>('/api/notifications/rules', { signal })
export const updateRule = (type: AutomaticType, body: { enabled: boolean; audienceRoles: UserRole[] }) =>
    apiFetch<NotificationRule>(`/api/notifications/rules/${type}`, { method: 'PUT', body })
