import { useState, useEffect } from 'react'
import {
    getOrders,
    changeOrderStatus,
    addOrderItem,
    removeOrderItem,
    applyDiscount,
    addTip,
    PaginatedOrdersResponse,
    OrderResponseDto,
    OrderStatus,
} from '@/lib/api/negocio/orders'
import { getTables, TableResponse } from '@/lib/api/admin/tables'
import { getProducts, ProductResponse } from '@/lib/api/admin/products'
import { toast } from '@/components/ToastProvider'

export function useOrdenes() {
    const [orders, setOrders] = useState<PaginatedOrdersResponse | null>(null)
    const [tables, setTables] = useState<TableResponse[]>([])
    const [products, setProducts] = useState<ProductResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')
    const [tableFilter, setTableFilter] = useState('')
    const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('')

    // Auto-load on filters or page change
    useEffect(() => {
        loadTables()
        loadProducts()
        loadOrders()
    }, [page, statusFilter, tableFilter, serviceTypeFilter])

    const loadTables = async () => {
        try {
            const data = await getTables(1, 1000)
            setTables(data.data)
        } catch (err) {
            console.error('Error loading tables:', err)
        }
    }

    const loadProducts = async () => {
        try {
            const data = await getProducts(1, 1000)
            setProducts(data.data)
        } catch (err) {
            console.error('Error loading products:', err)
        }
    }

    const loadOrders = async () => {
        setLoading(true)
        try {
            const data = await getOrders(page, 10, {
                status: statusFilter || undefined,
                tableId: tableFilter || undefined,
                serviceType: serviceTypeFilter ? (serviceTypeFilter as any) : undefined,
            })
            setOrders(data)
        } catch (err: any) {
            toast.error(err.message || 'Error loading orders')
        } finally {
            setLoading(false)
        }
    }

    const handleChangeStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            await changeOrderStatus(orderId, { status: newStatus })
            const statusLabel = newStatus === 'CERRADO' ? 'completada' : newStatus === 'BORRADOR' ? 'borrador' : 'cancelada'
            toast.success(`Orden marcada como ${statusLabel}`)
            await loadOrders()
        } catch (err: any) {
            toast.error(err.message || 'Error changing order status')
            throw err
        }
    }

    const handleAddItem = async (orderId: string, productId: string, quantity: number, notes?: string) => {
        try {
            await addOrderItem(orderId, { productId, quantity, notes })
            toast.success('Producto agregado a la orden')
            await loadOrders()
        } catch (err: any) {
            toast.error(err.message || 'Error adding item')
            throw err
        }
    }

    const handleRemoveItem = async (orderId: string, itemId: string) => {
        try {
            await removeOrderItem(orderId, itemId)
            toast.success('Producto removido de la orden')
            await loadOrders()
        } catch (err: any) {
            toast.error(err.message || 'Error removing item')
            throw err
        }
    }

    const handleApplyDiscount = async (orderId: string, type: 'percentage' | 'fixed', amount: number, reason?: string) => {
        try {
            const payload = type === 'percentage'
                ? { percentageDiscount: amount, reason }
                : { fixedDiscount: amount, reason }
            await applyDiscount(orderId, payload)
            toast.success('Descuento aplicado')
            await loadOrders()
        } catch (err: any) {
            toast.error(err.message || 'Error applying discount')
            throw err
        }
    }

    const handleAddTip = async (orderId: string, tipAmount: number) => {
        try {
            await addTip(orderId, tipAmount)
            toast.success('Propina agregada')
            await loadOrders()
        } catch (err: any) {
            toast.error(err.message || 'Error adding tip')
            throw err
        }
    }

    return {
        orders,
        tables,
        products,
        loading,
        page,
        statusFilter,
        tableFilter,
        serviceTypeFilter,
        setPage,
        setStatusFilter,
        setTableFilter,
        setServiceTypeFilter,
        loadOrders,
        handleChangeStatus,
        handleAddItem,
        handleRemoveItem,
        handleApplyDiscount,
        handleAddTip,
    }
}
