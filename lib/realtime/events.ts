import type { OrderKitchenStatus, OrderStatus, TableStatus } from '@/lib/types/enums'

export interface OrderCreatedEvent {
    orderId: string
    orderNumber?: string | number
    tableId: string
    createdByName?: string
    status: OrderStatus
    createdAt: string
}

export interface OrderItemAddedEvent {
    orderId: string
    tableId: string
    itemId: string
    productName: string
    quantity: number
    addedByName?: string
    unitPrice?: number | string
}

export interface OrderItemRemovedEvent {
    orderId: string
    tableId: string
    itemId: string
    productName: string
}

export interface OrderItemUpdatedEvent {
    orderId: string
    tableId: string
    itemId: string
    quantity: number
    subtotal: number | string
    updatedByName?: string
}

export interface OrderStatusChangedEvent {
    orderId: string
    tableId: string
    newStatus: OrderStatus
}

export interface OrderKitchenStatusChangedEvent {
    orderId: string
    tableId: string
    kitchenStatus: OrderKitchenStatus
}

export interface OrderUpdatedEvent {
    orderId: string
    tableId: string
    total: number | string
    discountAmount: number | string
    tipAmount: number | string
}

export interface TableStateUpdatedEvent {
    tableId: string
    orderState: { status?: OrderStatus } | null
    timestamp: string
}

export interface TablesStatusChangedEvent {
    tableId: string
    status: TableStatus
    tableName?: string
    areaId?: string
    areaName?: string
    timestamp: string
}

export interface TableSnapshotEntry {
    id: string
    number: number
    status: TableStatus
    areaId?: string
    areaName?: string
    hasActiveOrder: boolean
    currentOrderTotal?: number | string
    itemCount?: number
}

export interface TablesStateSnapshotEvent {
    tables: TableSnapshotEntry[]
    timestamp: string
}

export interface KitchenOrdersSnapshotEvent<TOrder = unknown> {
    orders: TOrder[]
    timestamp: string
}

export interface OrdersServerEvents {
    'order:created': (event: OrderCreatedEvent) => void
    'order:item:added': (event: OrderItemAddedEvent) => void
    'order:item:removed': (event: OrderItemRemovedEvent) => void
    'order:item:updated': (event: OrderItemUpdatedEvent) => void
    'order:status:changed': (event: OrderStatusChangedEvent) => void
    'order:kitchen-status:changed': (event: OrderKitchenStatusChangedEvent) => void
    'order:updated': (event: OrderUpdatedEvent) => void
    'table:state:updated': (event: TableStateUpdatedEvent) => void
    'tables:status:changed': (event: TablesStatusChangedEvent) => void
    'tables:state:snapshot': (event: TablesStateSnapshotEvent) => void
    'kitchen:orders:snapshot': (event: KitchenOrdersSnapshotEvent) => void
}

export interface OrdersClientEvents {
    'join:table': (tableId: string) => void
    'leave:table': (tableId: string) => void
    'subscribe:tables:status': () => void
    'unsubscribe:tables:status': () => void
    'subscribe:kitchen': () => void
    'unsubscribe:kitchen': () => void
}

export type OrdersEventName = keyof OrdersServerEvents

export const ORDERS_EVENT_NAMES: readonly OrdersEventName[] = [
    'order:created',
    'order:item:added',
    'order:item:removed',
    'order:item:updated',
    'order:status:changed',
    'order:kitchen-status:changed',
    'order:updated',
    'table:state:updated',
    'tables:status:changed',
    'tables:state:snapshot',
    'kitchen:orders:snapshot',
]
