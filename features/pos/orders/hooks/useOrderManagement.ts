'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { User } from '@/hooks/useAuth'
import { useOrderQuery, usePosTable } from './useOrderQuery'
import { useCart } from './useCart'
import { useOrderMutations } from './useOrderMutations'
import { useOrdersSocket } from '@/lib/realtime/useOrdersSocket'

export function useOrderManagement(tableId: string, user: User | null) {
    const { table, loading: tableLoading, refetch: refetchTable } = usePosTable(tableId)
    const {
        order,
        setOrder,
        loading: orderLoading,
        refreshOrder: refetchOrder,
    } = useOrderQuery(tableId)
    const {
        cartItems,
        setCartItems,
        syncFromOrder,
        applyServerOrder,
        markLocalChange,
        isRecentLocalChange,
    } = useCart()

    const onOrderClosedRef = useRef<
        ((status: 'CLOSED' | 'CANCELLED') => void) | null
    >(null)
    const syncedTableRef = useRef<string | null>(null)

    const refreshOrder = useCallback(async () => {
        const updated = await refetchOrder()
        if (updated) {
            setOrder(updated)
            applyServerOrder(updated)
        }
        return updated
    }, [refetchOrder, setOrder, applyServerOrder])

    useOrdersSocket({
        tableId,
        on: {
            'order:item:added': () => {
                void refreshOrder()
            },
            'order:item:removed': () => {
                void refreshOrder()
            },
            'order:updated': () => {
                void refreshOrder()
            },
            'order:status:changed': ({ newStatus }) => {
                if (newStatus === 'CLOSED' || newStatus === 'CANCELLED') {
                    setOrder(null)
                    onOrderClosedRef.current?.(newStatus)
                    return
                }
                void refreshOrder()
            },
            'table:state:updated': () => {
                if (isRecentLocalChange()) return
                void refreshOrder()
            },
        },
        onConnect: () => {
            void refreshOrder()
        },
    })

    const {
        handleOpenOrder,
        handleAddProduct,
        handleRemoveProduct,
        handleChangeQuantity,
        handleCancelOrder,
        handleApplyDiscount,
        handleAddTip,
    } = useOrderMutations({
        tableId,
        user,
        order,
        cartItems,
        setOrder,
        setCartItems,
        syncFromOrder,
        markLocalChange,
        refreshOrder,
        onOrderUnavailable: (status) => {
            setOrder(null)
            onOrderClosedRef.current?.(status ?? 'CLOSED')
        },
    })

    useEffect(() => {
        syncedTableRef.current = null
        syncFromOrder(null)
    }, [tableId, syncFromOrder])

    useEffect(() => {
        if (!tableId || !order) return
        if (syncedTableRef.current === tableId) return
        syncedTableRef.current = tableId
        syncFromOrder(order)
    }, [order, tableId, syncFromOrder])

    const loadData = useCallback(async () => {
        await Promise.all([refetchTable(), refetchOrder()])
    }, [refetchTable, refetchOrder])

    return {
        table,
        order,
        cartItems,
        loading: tableLoading || orderLoading,
        loadData,
        handleOpenOrder,
        handleAddProduct,
        handleRemoveProduct,
        handleChangeQuantity,
        handleCancelOrder,
        handleApplyDiscount,
        handleAddTip,
        setOrder,
        setCartItems,
        setOnOrderClosed: (
            callback: ((status: 'CLOSED' | 'CANCELLED') => void) | null,
        ) => {
            onOrderClosedRef.current = callback
        },
    }
}
