'use client'
import { useQuery } from '@tanstack/react-query'
import { getOrders, type OrderResponseDto } from '@/features/orders/api'
import { getTables } from '@/features/tables/api'

export interface LiveOrder {
    id: string
    orderNumber: string
    tableName: string
    minutesOpen: number
    itemCount: number
    total: number
    kitchenStatus: OrderResponseDto['kitchenStatus']
}

export interface LiveOperations {
    tables: { total: number; occupied: number; available: number; reserved: number; occupancy: number }
    openOrders: LiveOrder[]
    openTotal: number
    stale: number
    kitchen: { pending: number; preparing: number; ready: number }
}

export const STALE_ORDER_MINUTES = 90

export function useLiveOperations() {
    return useQuery({
        queryKey: ['dashboard', 'live'],
        refetchInterval: 20_000,
        queryFn: async ({ signal }): Promise<LiveOperations> => {
            const [tables, orders] = await Promise.all([
                getTables(1, 500, undefined, signal),
                getOrders(1, 100, { status: 'DRAFT' }, signal),
            ])
            const active = tables.data.filter((table) => table.isActive)
            const occupied = active.filter((table) => table.status === 'OCCUPIED').length
            const reserved = active.filter((table) => table.status === 'RESERVED').length
            const now = Date.now()
            const openOrders = orders.data
                .map<LiveOrder>((order) => ({
                    id: order.id,
                    orderNumber: order.orderNumber,
                    tableName: order.tableName,
                    minutesOpen: Math.max(0, Math.round((now - new Date(order.createdAt).getTime()) / 60000)),
                    itemCount: order.itemCount,
                    total: Number(order.total),
                    kitchenStatus: order.kitchenStatus,
                }))
                .sort((a, b) => b.minutesOpen - a.minutesOpen)
            return {
                tables: {
                    total: active.length,
                    occupied,
                    reserved,
                    available: active.length - occupied - reserved,
                    occupancy: active.length > 0 ? (occupied / active.length) * 100 : 0,
                },
                openOrders,
                openTotal: openOrders.reduce((sum, order) => sum + order.total, 0),
                stale: openOrders.filter((order) => order.minutesOpen >= STALE_ORDER_MINUTES).length,
                kitchen: {
                    pending: openOrders.filter((order) => order.kitchenStatus === 'PENDING').length,
                    preparing: openOrders.filter((order) => order.kitchenStatus === 'PREPARING').length,
                    ready: openOrders.filter((order) => order.kitchenStatus === 'READY').length,
                },
            }
        },
    })
}
