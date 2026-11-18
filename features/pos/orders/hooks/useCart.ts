'use client'
import { useCallback, useRef, useState } from 'react'
import type { OrderResponseDto } from '@/features/pos/orders/api'

export interface CartItem {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    subtotal: number
    addedByName?: string
}

function toCartItems(order: OrderResponseDto | null): CartItem[] {
    if (!order?.items) return []
    return order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        subtotal: item.subtotal,
        addedByName: item.addedByName,
    }))
}

export function useCart() {
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const lastLocalChangeRef = useRef<{ productId: string; timestamp: number } | null>(
        null,
    )

    const syncFromOrder = useCallback((order: OrderResponseDto | null) => {
        setCartItems(toCartItems(order))
    }, [])

    const markLocalChange = useCallback((productId: string) => {
        lastLocalChangeRef.current = { productId, timestamp: Date.now() }
    }, [])

    const isRecentLocalChange = useCallback((productId?: string) => {
        const last = lastLocalChangeRef.current
        if (!last) return false
        if (Date.now() - last.timestamp >= 500) return false
        return productId ? last.productId === productId : true
    }, [])

    const applyServerOrder = useCallback(
        (order: OrderResponseDto) => {
            setCartItems((prev) => {
                const backendItemsMap = new Map(
                    order.items.map((item) => [item.productId, item]),
                )

                const merged = prev
                    .map((localItem) => {
                        const backendItem = backendItemsMap.get(localItem.productId)
                        if (!backendItem) return localItem

                        const skipQuantitySync = isRecentLocalChange(
                            localItem.productId,
                        )
                        const addedByNameChanged =
                            localItem.addedByName !== backendItem.addedByName

                        return {
                            ...localItem,
                            ...(!skipQuantitySync
                                ? {
                                      quantity: backendItem.quantity,
                                      subtotal: backendItem.subtotal,
                                  }
                                : {}),
                            ...(addedByNameChanged
                                ? { addedByName: backendItem.addedByName }
                                : {}),
                            id: backendItem.id,
                        }
                    })
                    .filter((item) => backendItemsMap.has(item.productId))

                for (const [productId, backendItem] of backendItemsMap) {
                    if (!merged.find((item) => item.productId === productId)) {
                        merged.push({
                            id: backendItem.id,
                            productId: backendItem.productId,
                            productName: backendItem.productName,
                            unitPrice: backendItem.unitPrice,
                            quantity: backendItem.quantity,
                            subtotal: backendItem.subtotal,
                            addedByName: backendItem.addedByName,
                        })
                    }
                }

                return merged
            })
        },
        [isRecentLocalChange],
    )

    return {
        cartItems,
        setCartItems,
        syncFromOrder,
        applyServerOrder,
        markLocalChange,
        isRecentLocalChange,
    }
}
