'use client'
import { useState } from 'react'
import { useMutation, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { getTables, type TableResponse } from '@/features/tables/api'
import { getProducts, type ProductResponse } from '@/features/products/api'
import {
    addOrderItem,
    addTip,
    applyDiscount,
    changeOrderStatus,
    getOrders,
    removeOrderItem,
    type OrderStatus,
} from '../api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = {
    all: ['orders'] as const,
    tables: ['tables', 'options'] as const,
    products: ['products', 'options'] as const,
}

export function useOrders() {
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
    const [tableFilter, setTableFilter] = useState('')
    const [serviceTypeFilter, setServiceTypeFilter] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [
            ...KEYS.all,
            { page, statusFilter, tableFilter, serviceTypeFilter },
        ],
        placeholderData: keepPreviousData,
        queryFn: ({ signal }) =>
            getOrders(
                page,
                10,
                {
                    status: statusFilter || undefined,
                    tableId: tableFilter || undefined,
                    serviceType: serviceTypeFilter
                        ? (serviceTypeFilter as never)
                        : undefined,
                },
                signal,
            ),
    })

    const tablesQuery = useQuery({
        queryKey: KEYS.tables,
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getTables(1, 1000, undefined, signal),
    })

    const productsQuery = useQuery({
        queryKey: KEYS.products,
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) =>
            getProducts(1, 1000, undefined, undefined, signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const changeStatusMutation = useMutation({
        mutationFn: ({
            orderId,
            status,
        }: {
            orderId: string
            status: OrderStatus
        }) => changeOrderStatus(orderId, { status }),
        onSuccess: async (_data, variables) => {
            const label =
                variables.status === 'CLOSED'
                    ? 'completada'
                    : variables.status === 'DRAFT'
                      ? 'borrador'
                      : 'cancelada'
            toast.success(`Orden marcada como ${label}`)
            await invalidate()
        },
        onError: (error) =>
            toast.error(
                getErrorMessage(error, 'Error cambiando el estado de la orden'),
            ),
    })

    const addItemMutation = useMutation({
        mutationFn: ({
            orderId,
            productId,
            quantity,
            notes,
        }: {
            orderId: string
            productId: string
            quantity: number
            notes?: string
        }) => addOrderItem(orderId, { productId, quantity, notes }),
        onSuccess: async () => {
            toast.success('Producto agregado a la orden')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error agregando producto')),
    })

    const removeItemMutation = useMutation({
        mutationFn: ({
            orderId,
            itemId,
        }: {
            orderId: string
            itemId: string
        }) => removeOrderItem(orderId, itemId),
        onSuccess: async () => {
            toast.success('Producto removido de la orden')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error removiendo producto')),
    })

    const discountMutation = useMutation({
        mutationFn: ({
            orderId,
            type,
            amount,
            reason,
        }: {
            orderId: string
            type: 'percentage' | 'fixed'
            amount: number
            reason?: string
        }) =>
            applyDiscount(
                orderId,
                type === 'percentage'
                    ? { percentageDiscount: amount, reason }
                    : { fixedDiscount: amount, reason },
            ),
        onSuccess: async () => {
            toast.success('Descuento aplicado')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error aplicando descuento')),
    })

    const tipMutation = useMutation({
        mutationFn: ({
            orderId,
            tipAmount,
        }: {
            orderId: string
            tipAmount: number
        }) => addTip(orderId, tipAmount),
        onSuccess: async () => {
            toast.success('Propina agregada')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error agregando propina')),
    })

    return {
        orders: query.data ?? null,
        tables: (tablesQuery.data?.data ?? []) as TableResponse[],
        products: (productsQuery.data?.data ?? []) as ProductResponse[],
        loading: query.isLoading,
        page,
        statusFilter,
        tableFilter,
        serviceTypeFilter,
        setPage,
        setStatusFilter,
        setTableFilter,
        setServiceTypeFilter,
        loadOrders: () => {
            void query.refetch()
        },
        handleChangeStatus: (orderId: string, newStatus: OrderStatus) =>
            changeStatusMutation.mutateAsync({ orderId, status: newStatus }),
        handleAddItem: (
            orderId: string,
            productId: string,
            quantity: number,
            notes?: string,
        ) =>
            addItemMutation.mutateAsync({
                orderId,
                productId,
                quantity,
                notes,
            }),
        handleRemoveItem: (orderId: string, itemId: string) =>
            removeItemMutation.mutateAsync({ orderId, itemId }),
        handleApplyDiscount: (
            orderId: string,
            type: 'percentage' | 'fixed',
            amount: number,
            reason?: string,
        ) =>
            discountMutation.mutateAsync({ orderId, type, amount, reason }),
        handleAddTip: (orderId: string, tipAmount: number) =>
            tipMutation.mutateAsync({ orderId, tipAmount }),
    }
}
