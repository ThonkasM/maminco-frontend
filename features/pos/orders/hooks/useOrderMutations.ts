'use client'
import { useCallback, type Dispatch, type SetStateAction } from 'react'
import { toast } from '@/components/shared/ToastProvider'
import { ApiError } from '@/lib/http/client'
import { getErrorMessage } from '@/lib/utils/errors'
import { getUserDisplayName } from '@/lib/utils/getUserDisplayName'
import { roundMoney } from '@/lib/utils/money'
import {
    addOrderItem,
    addTip,
    applyDiscount,
    changeOrderStatus,
    createOrderIfNotExists,
    removeOrderItem,
    updateOrderItemQuantity,
    type ApplyDiscountPayload,
    type OrderResponseDto,
} from '@/features/pos/orders/api'
import type { ProductResponse } from '@/features/products/api'
import type { User } from '@/hooks/useAuth'
import type { CartItem } from './useCart'

interface UseOrderMutationsParams {
    tableId: string
    user: User | null
    order: OrderResponseDto | null
    cartItems: CartItem[]
    setOrder: (order: OrderResponseDto | null) => void
    setCartItems: Dispatch<SetStateAction<CartItem[]>>
    syncFromOrder: (order: OrderResponseDto | null) => void
    markLocalChange: (productId: string) => void
    refreshOrder: () => Promise<OrderResponseDto | null>
    /** Called when the backend rejects an action because the order is no longer open. */
    onOrderUnavailable?: (status?: 'CLOSED' | 'CANCELLED') => void
}

function isOrderUnavailable(error: unknown): boolean {
    return (
        error instanceof ApiError &&
        (error.status === 403 || error.status === 404 || error.status === 409)
    )
}

export function useOrderMutations({
    tableId,
    user,
    order,
    cartItems,
    setOrder,
    setCartItems,
    syncFromOrder,
    markLocalChange,
    refreshOrder,
    onOrderUnavailable,
}: UseOrderMutationsParams) {
    const handleRemoveProduct = useCallback(
        async (productId: string) => {
            if (!order) return
            const itemToRemove = order.items.find(
                (item) => item.productId === productId,
            )
            if (!itemToRemove) return

            setCartItems((prev) =>
                prev.filter((item) => item.productId !== productId),
            )
            setOrder({
                ...order,
                items: order.items.filter((item) => item.productId !== productId),
            })

            try {
                await removeOrderItem(order.id, itemToRemove.id)
            } catch (error) {
                if (isOrderUnavailable(error)) {
                    onOrderUnavailable?.()
                    return
                }
                toast.error(
                    getErrorMessage(error, 'Error eliminando el producto'),
                )
                await refreshOrder()
            }
        },
        [order, setCartItems, setOrder, refreshOrder, onOrderUnavailable],
    )

    const handleChangeQuantity = useCallback(
        async (productId: string, quantity: number) => {
            if (quantity < 1) {
                await handleRemoveProduct(productId)
                return
            }
            if (!order) return

            const orderItem = order.items.find((item) => item.productId === productId)
            const cartItem = cartItems.find((item) => item.productId === productId)
            if (!orderItem || !cartItem) return

            const newSubtotal = roundMoney(orderItem.unitPrice * quantity)
            const addedByName = getUserDisplayName(user)

            markLocalChange(productId)
            setCartItems((prev) =>
                prev.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity, subtotal: newSubtotal, addedByName }
                        : item,
                ),
            )
            setOrder({
                ...order,
                items: order.items.map((item) =>
                    item.productId === productId
                        ? { ...item, quantity, subtotal: newSubtotal, addedByName }
                        : item,
                ),
            })

            try {
                await updateOrderItemQuantity(order.id, orderItem.id, quantity)
            } catch (error) {
                if (isOrderUnavailable(error)) {
                    onOrderUnavailable?.()
                    return
                }
                toast.error(
                    getErrorMessage(error, 'Error actualizando la cantidad'),
                )
                await refreshOrder()
            }
        },
        [
            order,
            cartItems,
            user,
            markLocalChange,
            setCartItems,
            setOrder,
            handleRemoveProduct,
            refreshOrder,
            onOrderUnavailable,
        ],
    )

    const handleAddProduct = useCallback(
        async (product: ProductResponse, _user?: User | null) => {
            if (!user || !order) return

            const existingInOrder = order.items.find(
                (item) => item.productId === product.id,
            )
            if (existingInOrder) {
                await handleChangeQuantity(product.id, existingInOrder.quantity + 1)
                return
            }

            const unitPrice = Number(product.price)
            const optimisticItem: CartItem = {
                id: `temp-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                unitPrice,
                quantity: 1,
                subtotal: unitPrice,
                addedByName: user.name,
            }
            setCartItems((prev) => [...prev, optimisticItem])

            try {
                await addOrderItem(order.id, {
                    productId: product.id,
                    quantity: 1,
                    notes: '',
                })
            } catch (error) {
                setCartItems((prev) =>
                    prev.filter((item) => item.id !== optimisticItem.id),
                )
                if (isOrderUnavailable(error)) {
                    onOrderUnavailable?.()
                    return
                }
                toast.error(getErrorMessage(error, 'Error agregando el producto'))
                await refreshOrder()
            }
        },
        [
            user,
            order,
            setCartItems,
            handleChangeQuantity,
            refreshOrder,
            onOrderUnavailable,
        ],
    )

    const handleOpenOrder = useCallback(async () => {
        if (!user || order) return
        try {
            const newOrder = await createOrderIfNotExists(tableId, user.id)
            setOrder(newOrder)
            syncFromOrder(newOrder)
        } catch (error) {
            toast.error(getErrorMessage(error, 'Error abriendo la orden'))
        }
    }, [user, order, tableId, setOrder, syncFromOrder])

    const handleCancelOrder = useCallback(async () => {
        if (!order) return
        try {
            await changeOrderStatus(order.id, { status: 'CANCELLED' })
            setCartItems([])
            setOrder(null)
        } catch (error) {
            if (isOrderUnavailable(error)) {
                onOrderUnavailable?.('CANCELLED')
                return
            }
            toast.error(getErrorMessage(error, 'Error cancelando la orden'))
        }
    }, [order, setCartItems, setOrder, onOrderUnavailable])

    const handleApplyDiscount = useCallback(
        async (payload: ApplyDiscountPayload) => {
            if (!order) return null
            try {
                const updated = await applyDiscount(order.id, payload)
                setOrder(updated)
                syncFromOrder(updated)
                toast.success('Descuento aplicado')
                return updated
            } catch (error) {
                if (isOrderUnavailable(error)) {
                    onOrderUnavailable?.()
                    return null
                }
                toast.error(getErrorMessage(error, 'Error aplicando descuento'))
                return null
            }
        },
        [order, setOrder, syncFromOrder, onOrderUnavailable],
    )

    const handleAddTip = useCallback(
        async (tipAmount: number) => {
            if (!order) return null
            try {
                const updated = await addTip(order.id, tipAmount)
                setOrder(updated)
                syncFromOrder(updated)
                toast.success('Propina agregada')
                return updated
            } catch (error) {
                if (isOrderUnavailable(error)) {
                    onOrderUnavailable?.()
                    return null
                }
                toast.error(getErrorMessage(error, 'Error agregando propina'))
                return null
            }
        },
        [order, setOrder, syncFromOrder, onOrderUnavailable],
    )

    return {
        handleOpenOrder,
        handleAddProduct,
        handleRemoveProduct,
        handleChangeQuantity,
        handleCancelOrder,
        handleApplyDiscount,
        handleAddTip,
    }
}
