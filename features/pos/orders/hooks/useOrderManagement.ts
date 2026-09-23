import { useState, useCallback, useRef, useEffect } from 'react'
import { useOrderSocket } from './useOrderSocket'
import { getUserDisplayName } from '@/lib/utils/getUserDisplayName'
import {
    getActiveOrderByTable,
    createOrderIfNotExists,
    addOrderItem,
    removeOrderItem,
    updateOrderItemQuantity,
    changeOrderStatus,
    OrderResponseDto,
} from '@/features/pos/orders/api'
import { ProductResponse } from '@/features/products/api'

interface CartItem {
    id: string
    productId: string
    productName: string
    unitPrice: number
    quantity: number
    subtotal: number
    addedByName?: string
}

interface UseOrderManagementReturn {
    // Estado
    table: any | null
    order: OrderResponseDto | null
    cartItems: CartItem[]
    loading: boolean

    // Handlers
    loadData: () => Promise<void>
    handleOpenOrder: () => Promise<void>
    handleAddProduct: (product: ProductResponse, user: any) => Promise<void>
    handleRemoveProduct: (productId: string) => Promise<void>
    handleChangeQuantity: (productId: string, quantity: number) => Promise<void>
    handleCancelOrder: () => Promise<void>
    handleSubmitOrder: () => Promise<void>

    // Setters
    setOrder: (order: OrderResponseDto | null) => void
    setCartItems: (items: CartItem[]) => void
    setLoading: (loading: boolean) => void

    // Socket
    socket: any

    // Multi-user sync
    setOnOrderClosed: (callback: (() => void) | null) => void
}

/**
 * Hook masivo que gestiona TODO lo relacionado con órdenes:
 * - Estado de orden (carrito, items)
 * - WebSocket en tiempo real
 * - Sincronización optimista (cambios locales vs servidor)
 * - Deduplicación de cambios para evitar parpadeos
 * 
 * Este hook encapsula ~500 líneas de lógica compleja que estaban
 * directamente en el page.tsx. Responsabilidades:
 * - refreshOrder() con sincronización inteligente
 * - WebSocket listeners para real-time updates
 * - Optimistic updates con lastLocalChangeRef
 * - Manejo de add/remove/update items
 * - Cancelación de órdenes
 */
export function useOrderManagement(tableId: string, user: any): UseOrderManagementReturn {
    const [table, setTable] = useState<any | null>(null)
    const [order, setOrder] = useState<OrderResponseDto | null>(null)
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [loading, setLoading] = useState(true)

    // 🔍 Ref para evitar parpadeos: rastrear cambios locales recientes
    // Si hicimos un cambio local en los últimos 500ms, ignoramos el WebSocket
    const lastLocalChangeRef = useRef<{ productId: string; timestamp: number } | null>(null)

    // 🚪 Ref para callback cuando se cierra la orden (multi-user sync)
    const onOrderClosedRef = useRef<(() => void) | null>(null)

    const refreshOrder = useCallback(async () => {
        console.log('🔄 [refreshOrder] INICIO - Refrescando orden desde WebSocket...')
        try {
            const updatedOrder = await getActiveOrderByTable(tableId)
            console.log('🔄 [refreshOrder] Respuesta del servidor recibida:', {
                orderId: updatedOrder?.id,
                itemCount: updatedOrder?.items.length,
                items: updatedOrder?.items.map((i) => ({
                    id: i.id,
                    productId: i.productId,
                    productName: i.productName,
                    quantity: i.quantity,
                })),
            })

            if (updatedOrder) {
                console.log('✓ [refreshOrder] Orden refrescada exitosamente')
                setOrder(updatedOrder)

                // ⚡ IMPORTANTE: Mantener el ORDEN LOCAL de los items
                // No reorganizar los items basado en el servidor
                // Solo actualizar los valores (quantity, subtotal, addedByName)
                setCartItems((prevCartItems) => {
                    console.log('  📋 [refreshOrder.setCartItems] ANTES (prevCartItems):', {
                        count: prevCartItems.length,
                        items: prevCartItems.map((i) => ({
                            id: i.id,
                            productId: i.productId,
                            productName: i.productName,
                            quantity: i.quantity,
                        })),
                    })

                    // 🔍 Verificar si este cambio fue hecho por el usuario actual recientemente
                    const now = Date.now()
                    const isRecentLocalChange =
                        lastLocalChangeRef.current && now - lastLocalChangeRef.current.timestamp < 500

                    if (isRecentLocalChange) {
                        console.log(
                            `  ⏭️ [refreshOrder.setCartItems] Cambio local reciente detectado - ignorando refresh para evitar parpadeo`
                        )
                    }

                    // Crear mapa de items nuevos por productId para búsqueda rápida
                    const backendItemsMap = new Map(
                        updatedOrder.items.map((item) => [
                            item.productId,
                            {
                                id: item.id,
                                productId: item.productId,
                                productName: item.productName,
                                unitPrice: item.unitPrice,
                                quantity: item.quantity,
                                subtotal: item.subtotal,
                                addedByName: item.addedByName,
                            },
                        ])
                    )

                    console.log('  📊 [refreshOrder.setCartItems] Backend map:', {
                        size: backendItemsMap.size,
                        items: Array.from(backendItemsMap.entries()).map(([key, val]) => ({
                            productId: key,
                            quantity: val.quantity,
                        })),
                    })

                    // Actualizar items MANTENIENDO EL ORDEN LOCAL
                    const updatedCartItems = prevCartItems
                        .map((localItem) => {
                            const backendItem = backendItemsMap.get(localItem.productId)
                            if (backendItem) {
                                const skipQuantitySync =
                                    isRecentLocalChange &&
                                    lastLocalChangeRef.current?.productId === localItem.productId

                                const addedByNameChanged =
                                    localItem.addedByName !== backendItem.addedByName

                                console.log(
                                    `    ✏️ [refreshOrder.setCartItems] Actualizando item ${localItem.productId}:`,
                                    {
                                        before: { qty: localItem.quantity, id: localItem.id, addedBy: localItem.addedByName },
                                        after: { qty: backendItem.quantity, id: backendItem.id, addedBy: backendItem.addedByName },
                                        addedByNameChanged: addedByNameChanged,
                                        skipQuantitySync: skipQuantitySync,
                                    }
                                )

                                return {
                                    ...localItem,
                                    ...((!skipQuantitySync) && {
                                        quantity: backendItem.quantity,
                                        subtotal: backendItem.subtotal,
                                    }),
                                    ...(addedByNameChanged && { addedByName: backendItem.addedByName }),
                                    id: backendItem.id,
                                }
                            }
                            console.log(
                                `    ⚠️ [refreshOrder.setCartItems] Item ${localItem.productId} no existe en backend, eliminando`
                            )
                            return localItem
                        })
                        .filter((item) => {
                            const exists = backendItemsMap.has(item.productId)
                            if (!exists) {
                                console.log(`    🗑️ [refreshOrder.setCartItems] Filtrando (eliminando) item ${item.productId}`)
                            }
                            return exists
                        })

                    // Agregar items nuevos al final (agregados por otro usuario)
                    for (const [productId, backendItem] of backendItemsMap) {
                        if (!updatedCartItems.find((item) => item.productId === productId)) {
                            console.log(`    ➕ [refreshOrder.setCartItems] Agregando nuevo item ${productId} al final`)
                            updatedCartItems.push({
                                ...backendItem,
                            })
                        }
                    }

                    console.log('  📋 [refreshOrder.setCartItems] DESPUÉS (resultado final):', {
                        count: updatedCartItems.length,
                        items: updatedCartItems.map((i) => ({
                            id: i.id,
                            productId: i.productId,
                            productName: i.productName,
                            quantity: i.quantity,
                        })),
                    })

                    return updatedCartItems
                })
            }
        } catch (err) {
            console.error('❌ [refreshOrder] Error refrescando orden:', err)
        }
        console.log('🔄 [refreshOrder] FIN')
    }, [tableId])

    // WebSocket para sincronización en tiempo real
    const socket = useOrderSocket({
        tableId,
        onOrderItemAdded: (data) => {
            console.log('🔔 [SOCKET] order:item:added recibido:', data)
            console.log('  → Llamando refreshOrder()')
            refreshOrder()
        },
        onOrderItemRemoved: (data) => {
            console.log('🔔 [SOCKET] order:item:removed recibido:', data)
            console.log('  → Llamando refreshOrder()')
            refreshOrder()
        },
        onOrderUpdated: (data) => {
            console.log('🔔 [SOCKET] order:updated recibido:', data)
            console.log('  → Llamando refreshOrder()')
            refreshOrder()
        },
        onOrderStatusChanged: (data) => {
            console.log('🔔 [SOCKET] order:status:changed recibido:', data)
            console.log('  → Status:', data?.status)

            // 🚪 Si la orden se cerró remotamente, ejecutar callback
            if (data?.status === 'CLOSED') {
                console.log('🚪 [SOCKET] ¡Orden cerrada remotamente! Ejecutando callback...')
                onOrderClosedRef.current?.()
            }

            console.log('  → Llamando refreshOrder()')
            refreshOrder()
        },
        onTableStateUpdated: (data) => {
            console.log('🔔 [SOCKET] table:state:updated recibido:', data)

            const now = Date.now()
            const isRecentLocalChange =
                lastLocalChangeRef.current && now - lastLocalChangeRef.current.timestamp < 500

            if (isRecentLocalChange && lastLocalChangeRef.current) {
                console.log(
                    `  ⏭️ [SOCKET] Cambio local reciente detectado (hace ${now - lastLocalChangeRef.current.timestamp}ms) - IGNORANDO este evento para evitar parpadeo`
                )
                return
            }

            console.log('  → Llamando refreshOrder() para sincronizar estado completo')
            refreshOrder()
        },
    })

    // Efecto para escuchar eventos del socket directamente (debugging)
    useEffect(() => {
        if (!socket) {
            console.log('⚠️ Socket no disponible aún')
            return
        }

        console.log('🔗 Configurando listeners adicionales del socket')

        const handleOrderItemAdded = (data: any) => {
            console.log('✅ [DIRECT] order:item:added fue emitido por servidor:', data)
        }

        const handleOrderItemRemoved = (data: any) => {
            console.log('✅ [DIRECT] order:item:removed fue emitido por servidor:', data)
        }

        const handleOrderUpdated = (data: any) => {
            console.log('✅ [DIRECT] order:updated fue emitido por servidor:', data)
        }

        socket.on('order:item:added', handleOrderItemAdded)
        socket.on('order:item:removed', handleOrderItemRemoved)
        socket.on('order:updated', handleOrderUpdated)

        return () => {
            if (socket) {
                socket.off('order:item:added', handleOrderItemAdded)
                socket.off('order:item:removed', handleOrderItemRemoved)
                socket.off('order:updated', handleOrderUpdated)
            }
        }
    }, [socket])

    const loadData = async () => {
        setLoading(true)
        try {
            const { getTables } = await import('@/features/tables/api')
            const { getCategories } = await import('@/features/categories/api')
            const { getProducts } = await import('@/features/products/api')
            const { toast } = await import('@/components/shared/ToastProvider')

            // 1. Cargar mesa
            console.log('📍 Cargando mesa:', tableId)
            const tablesData = await getTables(1, 1000)
            const currentTable = tablesData.data.find((t) => t.id === tableId)
            if (!currentTable) {
                toast.error('Mesa no encontrada')
                return
            }
            setTable(currentTable)
            console.log('✓ Mesa cargada:', currentTable)

            // 2. Cargar orden activa
            console.log('📝 Buscando orden activa para mesa:', tableId)
            let activeOrder = null
            try {
                activeOrder = await getActiveOrderByTable(tableId)
                console.log('✓ Orden activa encontrada:', activeOrder)
            } catch (err: any) {
                console.warn('⚠️ No hay orden activa. Espera botón "Abrir Orden"')
            }

            setOrder(activeOrder || null)
            console.log('📋 Orden establecida:', activeOrder)
            if (activeOrder?.items) {
                setCartItems(
                    activeOrder.items.map((item: any) => ({
                        id: item.id,
                        productId: item.productId,
                        productName: item.productName,
                        unitPrice: item.unitPrice,
                        quantity: item.quantity,
                        subtotal: item.subtotal,
                        addedByName: item.addedByName,
                    }))
                )
                console.log('🛒 Items del carrito cargados desde servidor:', activeOrder.items)
            } else {
                setCartItems([])
            }

            // 3. Cargar categorías
            console.log('📂 Cargando categorías')
            const catsData = await getCategories(1, 1000)
            console.log('✓ Categorías cargadas:', catsData.data.length)

            // 4. Cargar productos
            console.log('🛍️ Cargando productos')
            const prodsData = await getProducts(1, 1000)
            console.log('✓ Productos cargados:', prodsData.data.length)
        } catch (err: any) {
            console.error('❌ Error en loadData:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleOpenOrder = async () => {
        if (!user) {
            console.error('No hay sesión activa')
            return
        }

        if (order) {
            console.log('ℹ️ Ya hay una orden abierta')
            return
        }

        try {
            console.log('🆕 Abriendo nueva orden para mesa:', tableId)
            const newOrder = await createOrderIfNotExists(tableId, user.id)
            console.log('✓ Orden abierta:', newOrder)

            setOrder(newOrder)

            if (newOrder?.items && newOrder.items.length > 0) {
                const items: CartItem[] = newOrder.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    productName: item.productName,
                    unitPrice: item.unitPrice,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    addedByName: item.addedByName,
                }))
                setCartItems(items)
                console.log('🛒 Items iniciales de la orden:', items)
            } else {
                setCartItems([])
            }
        } catch (err: any) {
            console.error('❌ Error abriendo orden:', err)
        }
    }

    const handleAddProduct = async (product: ProductResponse) => {
        if (!user) {
            console.error('No hay sesión activa')
            return
        }

        if (!order) {
            console.error('❌ Debes abrir una orden primero')
            return
        }

        const existingInOrder = order.items.find((item) => item.productId === product.id)

        if (existingInOrder) {
            console.log(`📝 Producto existe. Incrementando cantidad de: ${product.name}`)
            handleChangeQuantity(product.id, existingInOrder.quantity + 1)
        } else {
            console.log(`✨ Creando nuevo item: ${product.name}`)

            const unitPrice = Number(product.price)
            const subtotal = unitPrice * 1

            const newItem: CartItem = {
                id: `temp-${Date.now()}`,
                productId: product.id,
                productName: product.name,
                unitPrice,
                quantity: 1,
                subtotal,
                addedByName: user.name,
            }
            setCartItems([...cartItems, newItem])
            console.log(`  ⚡ Item agregado al carrito local (sin parpadeo)`)

            addOrderItem(order.id, {
                productId: product.id,
                quantity: 1,
                notes: '',
            })
                .then(() => {
                    console.log(`✓ ${product.name} agregado al backend`)
                })
                .catch((err) => {
                    console.error('Error guardando item:', err)
                    setCartItems((prev) => prev.filter((item) => item.id !== newItem.id))
                    refreshOrder()
                })
        }
    }

    const handleRemoveProduct = async (productId: string) => {
        const itemToRemove = order?.items.find((item) => item.productId === productId)
        if (!itemToRemove || !order) {
            console.error('No se puede eliminar el item')
            return
        }

        try {
            console.log(`🗑️ Eliminando item: ${itemToRemove.productName}`)

            setCartItems((prev) => prev.filter((item) => item.productId !== productId))
            console.log(`  ⚡ Item removido del carrito local (sin parpadeo)`)

            if (order) {
                const updatedOrder = {
                    ...order,
                    items: order.items.filter((item) => item.productId !== productId),
                }
                setOrder(updatedOrder)
            }

            await removeOrderItem(order.id, itemToRemove.id)
            console.log('✓ Item eliminado del backend')
        } catch (err: any) {
            console.error('Error eliminando item:', err)
            await refreshOrder()
        }
    }

    const handleChangeQuantity = async (productId: string, quantity: number) => {
        console.log('╔═══════════════════════════════════════════════════════════════╗')
        console.log('║ handleChangeQuantity INICIO')
        console.log('╚═══════════════════════════════════════════════════════════════╝')
        console.log(`  productId: ${productId}`)
        console.log(`  nueva quantity: ${quantity}`)

        if (quantity < 1) {
            console.log('  → quantity < 1, llamando handleRemoveProduct()')
            handleRemoveProduct(productId)
            return
        }

        const cartItemToUpdate = cartItems.find((item) => item.productId === productId)
        const itemToUpdate = order?.items.find((item) => item.productId === productId)

        console.log('  📦 Estado ANTES de cambios:')
        console.log('    cartItemToUpdate:', cartItemToUpdate)
        console.log('    itemToUpdate:', itemToUpdate)

        if (!itemToUpdate || !order || !cartItemToUpdate) {
            console.error('❌ No se encontró el item a actualizar')
            return
        }

        try {
            console.log(`  📝 Actualizando cantidad: ${itemToUpdate.quantity} → ${quantity}`)

            const newSubtotal = itemToUpdate.unitPrice * quantity
            const currentUserName = getUserDisplayName(user)

            const updatedCartItems = cartItems.map((item) =>
                item.productId === productId
                    ? {
                        ...item,
                        quantity,
                        subtotal: newSubtotal,
                        addedByName: currentUserName,
                    }
                    : item
            )

            console.log('  ⚡ Carrito LOCAL actualizado (optimistic):')
            console.log(
                '    cartItems ANTES:',
                cartItems.map((i) => ({
                    productId: i.productId,
                    qty: i.quantity,
                    addedBy: i.addedByName,
                }))
            )
            console.log(
                '    cartItems DESPUÉS:',
                updatedCartItems.map((i) => ({
                    productId: i.productId,
                    qty: i.quantity,
                    addedBy: i.addedByName,
                }))
            )

            lastLocalChangeRef.current = { productId, timestamp: Date.now() }
            console.log(`  ⏱️ Cambio local registrado en timestamp ${lastLocalChangeRef.current.timestamp}`)

            setCartItems(updatedCartItems)

            if (order) {
                const updatedOrder = {
                    ...order,
                    items: order.items.map((item) =>
                        item.productId === productId
                            ? {
                                ...item,
                                quantity,
                                subtotal: newSubtotal,
                                addedByName: currentUserName,
                            }
                            : item
                    ),
                }
                setOrder(updatedOrder)
            }

            console.log(`  📡 Enviando PATCH al backend...`)
            await updateOrderItemQuantity(order.id, itemToUpdate.id, quantity)

            console.log(`  ✓ PATCH completado exitosamente`)
            console.log('╔═══════════════════════════════════════════════════════════════╗')
            console.log('║ handleChangeQuantity FIN (éxito)')
            console.log('╚═══════════════════════════════════════════════════════════════╝')
        } catch (err: any) {
            console.error('❌ Error actualizando cantidad:', err)
            console.log('  → Llamando refreshOrder() para revertir cambios...')
            await refreshOrder()
            console.log('╔═══════════════════════════════════════════════════════════════╗')
            console.log('║ handleChangeQuantity FIN (error, revertido)')
            console.log('╚═══════════════════════════════════════════════════════════════╝')
        }
    }

    const handleCancelOrder = async () => {
        if (!order) return

        try {
            console.log('❌ Cancelando orden:', order.id)

            await changeOrderStatus(order.id, { status: 'CANCELLED' })
            console.log('✓ Orden marcada como CANCELLED')

            setCartItems([])
            setOrder(null)
        } catch (err: any) {
            console.error('❌ Error cancelando orden:', err)
        }
    }

    const handleSubmitOrder = async () => {
        if (!order || cartItems.length === 0) {
            console.error('No hay items para agregar')
            return
        }

        try {
            console.log('📤 Enviando items al backend...')

            for (const item of cartItems) {
                console.log(`  → Agregando: ${item.productName} x${item.quantity}`)
                await addOrderItem(order.id, {
                    productId: item.productId,
                    quantity: item.quantity,
                    notes: '',
                })
            }

            console.log('🔄 Recargando orden...')
            let updatedOrder = await getActiveOrderByTable(tableId)

            if (updatedOrder && updatedOrder.items.length === order.items.length) {
                console.log('⏳ Esperando actualización del backend...')
                await new Promise((resolve) => setTimeout(resolve, 500))
                updatedOrder = await getActiveOrderByTable(tableId)
            }

            if (updatedOrder) {
                setOrder(updatedOrder)
                console.log('✓ Orden actualizada:', updatedOrder)

                setCartItems((prevItems) => {
                    const backendItemsMap = new Map(
                        updatedOrder.items.map((item) => [
                            item.productId,
                            {
                                id: item.id,
                                productId: item.productId,
                                productName: item.productName,
                                unitPrice: item.unitPrice,
                                quantity: item.quantity,
                                subtotal: item.subtotal,
                                addedByName: item.addedByName,
                            },
                        ])
                    )

                    const updatedCartItems = prevItems
                        .map((localItem) => {
                            const backendItem = backendItemsMap.get(localItem.productId)
                            if (backendItem) {
                                return {
                                    ...localItem,
                                    quantity: backendItem.quantity,
                                    subtotal: backendItem.subtotal,
                                    addedByName: backendItem.addedByName,
                                    id: backendItem.id,
                                }
                            }
                            return localItem
                        })
                        .filter((item) => backendItemsMap.has(item.productId))

                    console.log('✓ Carrito sincronizado (orden mantenido):', updatedCartItems)
                    return updatedCartItems
                })
            }
        } catch (err: any) {
            console.error('❌ Error agregando items:', err)
        }
    }

    return {
        table,
        order,
        cartItems,
        loading,
        loadData,
        handleOpenOrder,
        handleAddProduct,
        handleRemoveProduct,
        handleChangeQuantity,
        handleCancelOrder,
        handleSubmitOrder,
        setOrder,
        setCartItems,
        setLoading,
        socket,
        setOnOrderClosed: (callback: (() => void) | null) => {
            onOrderClosedRef.current = callback
        },
    }
}
