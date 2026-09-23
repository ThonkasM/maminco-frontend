'use client'
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { toast } from '@/components/shared/ToastProvider'
import { useConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useOrderManagement } from '@/features/pos/orders/hooks/useOrderManagement'
import { usePaymentPosUI } from '@/features/pos/orders/hooks/usePaymentPosUI'
import { CartItemsList } from '@/features/pos/orders/components/CartItemsList'
import { CartSummary } from '@/features/pos/orders/components/CartSummary'
import { ProductCatalog } from '@/features/pos/orders/components/ProductCatalog'
import { PaymentMethodSelector } from '@/features/pos/orders/components/PaymentMethodSelector'
import { CategorySelector } from '@/features/pos/orders/components/CategorySelector'
import { PaymentDetailView } from '@/features/pos/orders/components/PaymentDetailView'
import { CashPaymentForm } from '@/features/pos/orders/components/CashPaymentForm'
import { TransferPaymentForm } from '@/features/pos/orders/components/TransferPaymentForm'
import { CardPaymentForm } from '@/features/pos/orders/components/CardPaymentForm'
import * as adminPaymentsApi from '@/features/payments/api'
import { formatCurrency } from '@/lib/utils/currency'
import { processPayment } from '@/features/pos/payments/api'
import { ArrowLeft } from 'lucide-react'

interface PaymentMethod {
    id: string
    name: string
    code: string
    isActive: boolean
}

interface RegisteredPayment {
    paymentMethodId: string
    methodName: string
    methodCode: string
    amount: number
}

export default function OrderNegocioPage() {
    const params = useParams()
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const tableId = params.tableId as string
    const { showConfirmation, ConfirmDialogComponent } = useConfirmDialog()

    // ==========================================
    // HOOKS PERSONALIZADOS
    // ==========================================

    const {
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
        setOnOrderClosed,
    } = useOrderManagement(tableId, user)

    const {
        showPaymentModal,
        paymentMode,
        selectedPaymentMethod,
        handleOpenPaymentModal,
        handleClosePaymentModal,
        handleSelectPaymentMethod,
        handleResetPaymentSelection,
    } = usePaymentPosUI()

    // ==========================================
    // ESTADO LOCAL
    // ==========================================

    const [categories, setCategories] = useState<any[]>([])
    const [products, setProducts] = useState<any[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
    const [registeredPayments, setRegisteredPayments] = useState<RegisteredPayment[]>([])

    // ==========================================
    // EFECTOS
    // ==========================================

    useEffect(() => {
        loadData()
    }, [tableId])

    // 🚪 Registrar callback para cuando se cierre la orden remotamente
    useEffect(() => {
        setOnOrderClosed(() => {
            handleClosePaymentModal()
            handleResetPaymentSelection()
            setOrder(null)
            setCartItems([])
            toast.success('La orden fue cerrada por otro usuario')
            setTimeout(() => router.push('/pos/tables'), 1200)
        })
    }, [setOnOrderClosed, setOrder, setCartItems, handleClosePaymentModal, handleResetPaymentSelection, router])

    useEffect(() => {
        const loadCategories = async () => {
            const { getCategories } = await import('@/features/categories/api')
            const catsData = await getCategories(1, 1000)
            setCategories(catsData.data)
        }

        const loadProducts = async () => {
            const { getProducts } = await import('@/features/products/api')
            const prodsData = await getProducts(1, 1000)
            setProducts(prodsData.data)
        }

        loadCategories().catch(() => undefined)
        loadProducts().catch(() => undefined)
    }, [])

    // ==========================================
    // HANDLERS
    // ==========================================

    const loadPaymentMethods = async () => {
        try {
            const methods = await adminPaymentsApi.listPaymentMethods(true)
            setPaymentMethods(methods)
            handleResetPaymentSelection()
        } catch {
            toast.error('Error cargando métodos de pago')
        }
    }

    const handleCancelOrderWithConfirm = async () => {
        if (!order) return

        const confirmed = await showConfirmation({
            title: 'Cancelar Orden',
            message: `Estás a punto de cancelar la orden de la Mesa ${table?.number}.\n\nEsta acción:\n• Marcará la orden como CANCELLED\n• Preservará todos los items para referencia\n• No se puede deshacer\n\n¿Deseas continuar?`,
            confirmText: '✕ Cancelar Orden',
            cancelText: 'Volver',
            confirmButtonClass: 'bg-red-600 hover:bg-red-700',
        })

        if (!confirmed) return

        try {
            await handleCancelOrder()
            toast.success('Orden cancelada correctamente')
            setTimeout(() => router.push('/pos/tables'), 800)
        } catch (err: any) {
            toast.error(err.message || 'Error al cancelar la orden')
        }
    }

    const handleFinalizePay = async () => {
        if (!order) return

        if (registeredPayments.length === 0) {
            toast.error('Registra al menos un pago antes de finalizar')
            return
        }

        try {
            let lastResult: Awaited<ReturnType<typeof processPayment>> | undefined

            for (const payment of registeredPayments) {
                let result = await processPayment(order.id, {
                    paymentMethodId: payment.paymentMethodId,
                    amountReceived: payment.amount,
                })

                if (result.status === 'PENDING_CONFIRMATION') {
                    result = await processPayment(order.id, {
                        paymentMethodId: payment.paymentMethodId,
                        amountReceived: payment.amount,
                        isExtraTip: true,
                    })
                }

                if (result.status === 'ERROR') {
                    throw new Error(result.message || 'Error procesando el pago')
                }

                lastResult = result
            }

            if (lastResult && !lastResult.isPaid) {
                toast.error(
                    `Pago parcial registrado. Saldo pendiente: ${formatCurrency(lastResult.pendingBalance ?? 0)}`,
                )
                await loadData()
                return
            }

            toast.success('Orden cerrada correctamente')
            setRegisteredPayments([])
            setCartItems([])
            setOrder(null)
            handleClosePaymentModal()
            handleResetPaymentSelection()
            setTimeout(() => router.push('/pos/tables'), 500)
        } catch (err: any) {
            toast.error(err.message || 'Error finalizando pago')
        }
    }

    // ==========================================
    // COMPUTADOS
    // ==========================================

    const filteredProducts = selectedCategory
        ? products.filter((p) => p.categoryId === selectedCategory)
        : []

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
    const totalPaid = registeredPayments.reduce((sum, p) => sum + p.amount, 0)
    const change = totalPaid - subtotal

    // ==========================================
    // RENDER
    // ==========================================

    if (loading) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="text-center">
                    <div className="inline-block animate-spin mb-4">⌛</div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando order...</p>
                </div>
            </div>
        )
    }

    if (!table) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400">Table no encontrada</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full w-screen flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
            {/* MAIN CONTENT: 3 COLUMNAS */}
            <div className="flex-1 flex overflow-hidden">
                {/* COLUMNA 1: CARRITO (40%) */}
                <div className="w-2/5 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
                    {/* HEADER DE MESA EN COLUMNA 1 */}
                    <div className="shrink-0 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {!order ? (
                                    <button
                                        onClick={handleOpenOrder}
                                        className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium"
                                    >
                                        Abrir
                                    </button>
                                ) : null}
                                <h2 className="font-bold text-slate-900 dark:text-white">
                                    Table {table?.number}
                                </h2>
                            </div>

                            <button
                                onClick={() => router.push('/pos/tables')}
                                className="p-1.5 bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white rounded text-sm font-bold hover:bg-slate-300 dark:hover:bg-slate-500 transition-all flex items-center gap-2"
                                title="Volver a mesas"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                MESAS
                            </button>

                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                Order: {order?.orderNumber || 'N/A'} | {order ? `Estado: ${order.status}` : 'Sin orden'}
                            </p>
                            {order?.createdByName && (
                                <p className="text-xs text-slate-500 dark:text-slate-500">
                                    Inicializada por: {order.createdByName}
                                </p>
                            )}
                        </div>
                    </div>

                    {order ? (
                        <>
                            <div className="flex-1 overflow-hidden">
                                <CartItemsList
                                    items={cartItems}
                                    onChangeQuantity={handleChangeQuantity}
                                    onRemove={handleRemoveProduct}
                                />
                            </div>
                            <div className="shrink-0">
                                <CartSummary
                                    subtotal={subtotal}
                                    paymentMode={paymentMode}
                                    totalPaid={totalPaid}
                                    orderId={order.id}
                                    orderNumber={order.orderNumber}
                                    onCancelOrder={handleCancelOrderWithConfirm}
                                    onStartPayment={() => {
                                        handleOpenPaymentModal()
                                        loadPaymentMethods()
                                    }}
                                    onFinalizePayment={handleFinalizePay}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-700 overflow-y-auto">
                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                Sin order abierta
                            </p>
                        </div>
                    )}
                </div>

                {/* COLUMNA 2: CATEGORÍAS o MÉTODOS DE PAGO (15%) */}
                <div className="w-1/6 border-r border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex flex-col overflow-hidden">
                    {paymentMode ? (
                        <PaymentMethodSelector
                            methods={paymentMethods}
                            selectedMethodId={selectedPaymentMethod}
                            onSelectMethod={handleSelectPaymentMethod}
                        />
                    ) : (
                        <CategorySelector
                            categories={categories}
                            selectedCategoryId={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    )}
                </div>

                {/* COLUMNA 3: PRODUCTOS o PAGO (45%) */}
                <div className="flex-1 bg-white dark:bg-slate-900 overflow-hidden">
                    {paymentMode ? (
                        // MODO PAGO: Mostrar formularios según método seleccionado
                        selectedPaymentMethod ? (
                            (() => {
                                const selectedMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod)
                                return (
                                    <>
                                        {selectedMethod?.code === 'CASH' && (
                                            <CashPaymentForm
                                                total={order?.total || 0}
                                                onSubmit={(data) => {
                                                    setRegisteredPayments((prev) => [...prev, {
                                                        paymentMethodId: selectedMethod.id,
                                                        methodName: selectedMethod.name,
                                                        methodCode: selectedMethod.code,
                                                        amount: data.amount,
                                                    }])
                                                    handleResetPaymentSelection()
                                                    toast.success(`Efectivo: ${formatCurrency(data.amount)}`)
                                                }}
                                                onBack={handleResetPaymentSelection}
                                            />
                                        )}
                                        {selectedMethod?.code === 'TRANSFER' && (
                                            <TransferPaymentForm
                                                total={order?.total || 0}
                                                onSubmit={(data) => {
                                                    setRegisteredPayments((prev) => [...prev, {
                                                        paymentMethodId: selectedMethod.id,
                                                        methodName: selectedMethod.name,
                                                        methodCode: selectedMethod.code,
                                                        amount: data.amount,
                                                    }])
                                                    handleResetPaymentSelection()
                                                    toast.success(`Transferencia: ${formatCurrency(data.amount)}`)
                                                }}
                                                onBack={handleResetPaymentSelection}
                                            />
                                        )}
                                        {selectedMethod?.code === 'CARD' && (
                                            <CardPaymentForm
                                                total={order?.total || 0}
                                                onSubmit={(data) => {
                                                    setRegisteredPayments((prev) => [...prev, {
                                                        paymentMethodId: selectedMethod.id,
                                                        methodName: selectedMethod.name,
                                                        methodCode: selectedMethod.code,
                                                        amount: data.amount,
                                                    }])
                                                    handleResetPaymentSelection()
                                                    toast.success(`Tarjeta: ${formatCurrency(data.amount)}`)
                                                }}
                                                onBack={handleResetPaymentSelection}
                                            />
                                        )}
                                    </>
                                )
                            })()
                        ) : (
                            <PaymentDetailView
                                subtotal={subtotal}
                                registeredPayments={registeredPayments}
                                change={totalPaid - subtotal}
                                totalPaid={totalPaid}
                                onBack={() => {
                                    handleClosePaymentModal()
                                    handleResetPaymentSelection()
                                }}
                                onAddPayment={() => { }}
                                onFinalize={handleFinalizePay}
                            />
                        )
                    ) : (
                        <ProductCatalog
                            products={filteredProducts.map((p: any) => ({
                                id: p.id,
                                name: p.name,
                                categoryName: p.categoryName,
                                price: p.price,
                            }))}
                            onAddProduct={(product) => {
                                const fullProduct = filteredProducts.find((p: any) => p.id === product.id)
                                if (fullProduct) {
                                    handleAddProduct(fullProduct, user)
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {/* MODALS */}
            {ConfirmDialogComponent}
        </div>
    )
}
