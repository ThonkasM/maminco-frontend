'use client'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getUsers } from '@/features/users/api'
import { getOrderHistory } from '@/features/orders/api'
import { getAuditOrders, type AuditQuery } from './api'

export function useAuditOrders(query: AuditQuery) {
    return useQuery({
        queryKey: ['audit', 'orders', query],
        queryFn: ({ signal }) => getAuditOrders(query, signal),
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: true,
    })
}

export function useAuditStaff() {
    return useQuery({
        queryKey: ['audit', 'staff'],
        queryFn: ({ signal }) => getUsers(1, 100, undefined, signal),
        staleTime: 5 * 60_000,
        select: (response) => response.data.filter((user) => user.isActive),
    })
}

export function useOrderChanges(orderId: string | null) {
    return useQuery({
        queryKey: ['audit', 'order', orderId, 'changes'],
        queryFn: ({ signal }) => getOrderHistory(orderId as string, 1, 500, signal),
        enabled: Boolean(orderId),
    })
}
