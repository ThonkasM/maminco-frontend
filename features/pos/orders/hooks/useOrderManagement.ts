'use client'
import { useCallback, useEffect, useRef } from 'react'
import type { User } from '@/hooks/useAuth'
import { useOrderQuery, usePosTable } from './useOrderQuery'
import { useCart } from './useCart'
import { useOrderMutations } from './useOrderMutations'
import { useOrderSocket } from './useOrderSocket'

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

    const onOrderClosedRef = useRef<(() => void) | null>(null)
    const syncedTableRef = useRef<string | null>(null)

    const refreshOrder = useCallback(async () => {
        const updated = await refetchOrder()
        if (updated) {
            setOrder(updated)
            applyServerOrder(updated)
        }
        return updated
    }, [refetchOrder, setOrder, applyServerOrder])

    useOrderSocket({
        tableId,
        onOrderItemAdded: () => {
            void refreshOrder()
        },
        onOrderItemRemoved: () => {
            void refreshOrder()
        },
        onOrderUpdated: () => {
            void refreshOrder()
        },
        onOrderStatusChanged: (data) => {
            if (data?.status === 'CLOSED') onOrderClosedRef.current?.()
            void refreshOrder()
        },
        onTableStateUpdated: () => {
            if (isRecentLocalChange()) return
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
        setOnOrderClosed: (callback: (() => void) | null) => {
            onOrderClosedRef.current = callback
        },
    }
}
