'use client'
import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getActiveAreas } from '@/features/areas/api'
import { getTables } from '@/features/tables/api'
import { getActiveOrderByTable } from '@/features/pos/orders/api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = {
    areas: ['pos', 'areas'] as const,
    tables: ['pos', 'tables'] as const,
    activeOrders: ['pos', 'tables', 'active-orders'] as const,
}

export function usePosTables() {
    const queryClient = useQueryClient()

    const areasQuery = useQuery({
        queryKey: KEYS.areas,
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getActiveAreas(signal),
    })

    const tablesQuery = useQuery({
        queryKey: KEYS.tables,
        staleTime: STALE_TIME.live,
        queryFn: ({ signal }) => getTables(1, 1000, undefined, signal),
    })

    const tables = tablesQuery.data?.data ?? []

    const activeOrdersQuery = useQuery({
        queryKey: KEYS.activeOrders,
        staleTime: STALE_TIME.live,
        enabled: tables.length > 0,
        refetchInterval: 120000,
        queryFn: async ({ signal }) => {
            const states: Record<string, boolean> = {}
            await Promise.all(
                tables.map(async (table) => {
                    try {
                        const order = await getActiveOrderByTable(table.id, signal)
                        states[table.id] = Boolean(order && order.status === 'DRAFT')
                    } catch {
                        states[table.id] = false
                    }
                }),
            )
            return states
        },
    })

    const setActiveOrder = useCallback(
        (tableId: string, occupied: boolean) => {
            queryClient.setQueryData<Record<string, boolean>>(
                KEYS.activeOrders,
                (prev) => ({ ...(prev ?? {}), [tableId]: occupied }),
            )
        },
        [queryClient],
    )

    const setActiveOrders = useCallback(
        (states: Record<string, boolean>) => {
            queryClient.setQueryData(KEYS.activeOrders, states)
        },
        [queryClient],
    )

    return {
        areas: areasQuery.data ?? [],
        tables,
        activeOrders: activeOrdersQuery.data ?? {},
        loading: areasQuery.isLoading || tablesQuery.isLoading,
        error: areasQuery.error || tablesQuery.error || null,
        refetch: () => {
            void areasQuery.refetch()
            void tablesQuery.refetch()
            void activeOrdersQuery.refetch()
        },
        setActiveOrder,
        setActiveOrders,
    }
}
