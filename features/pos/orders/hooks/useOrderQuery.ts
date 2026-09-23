'use client'
import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    getActiveOrderByTable,
    type OrderResponseDto,
} from '@/features/pos/orders/api'
import { getTableById } from '@/features/tables/api'

export const posOrderKeys = {
    active: (tableId: string) => ['pos', 'orders', 'active', tableId] as const,
    table: (tableId: string) => ['pos', 'tables', tableId] as const,
}

export function useOrderQuery(tableId: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: posOrderKeys.active(tableId),
        queryFn: ({ signal }) => getActiveOrderByTable(tableId, signal),
        enabled: Boolean(tableId),
    })

    const setOrder = useCallback(
        (next: OrderResponseDto | null) => {
            queryClient.setQueryData(posOrderKeys.active(tableId), next)
        },
        [queryClient, tableId],
    )

    const refreshOrder = useCallback(async () => {
        const result = await query.refetch()
        return result.data ?? null
    }, [query])

    return {
        order: query.data ?? null,
        loading: query.isLoading,
        setOrder,
        refreshOrder,
    }
}

export function usePosTable(tableId: string) {
    const query = useQuery({
        queryKey: posOrderKeys.table(tableId),
        queryFn: ({ signal }) => getTableById(tableId, signal),
        enabled: Boolean(tableId),
    })

    return {
        table: query.data ?? null,
        loading: query.isLoading,
        refetch: query.refetch,
    }
}
