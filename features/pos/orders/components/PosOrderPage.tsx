'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Plus, UtensilsCrossed } from 'lucide-react'
import { Button, EmptyState, Spinner } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { useConfirmDialog } from '@/components/shared/ConfirmDialog'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils/currency'
import { getErrorMessage } from '@/lib/utils/errors'
import { listPaymentMethods, type PaymentMethodDto } from '@/features/payments/api'
import { useOrderManagement } from '@/features/pos/orders/hooks/useOrderManagement'
import { usePaymentPosUI } from '@/features/pos/orders/hooks/usePaymentPosUI'
import { usePosCatalog } from '@/features/pos/orders/hooks/usePosCatalog'
import { processPayment } from '@/features/pos/payments/api'
import { CartItemsList } from './CartItemsList'
import { CartSummary } from './CartSummary'
import { ProductCatalog } from './ProductCatalog'
import { PaymentMethodSelector } from './PaymentMethodSelector'
import { CategorySelector } from './CategorySelector'
import { PaymentDetailView } from './PaymentDetailView'
import { CashPaymentForm } from './CashPaymentForm'
import { TransferPaymentForm } from './TransferPaymentForm'
import { CardPaymentForm } from './CardPaymentForm'

interface RegisteredPayment {
    paymentMethodId: string
    methodName: string
    methodCode: string
    amount: number
}

export function PosOrderPage() {
    const params = useParams()
    const router = useRouter()
    const user = useAuth((s) => s.user)
    const tableId = params.tableId as string
    const { showConfirmation, ConfirmDialogComponent } = useConfirmDialog()

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
        setOrder,
        setCartItems,
        setOnOrderClosed,
    } = useOrderManagement(tableId, user)

    const {
        paymentMode,
        selectedPaymentMethod,
        handleOpenPaymentModal,
        handleClosePaymentModal,
        handleSelectPaymentMethod,
        handleResetPaymentSelection,
    } = usePaymentPosUI()

    const { categories, products } = usePosCatalog()

    const { data: paymentMethods = [] } = useQuery({
        queryKey: ['pos', 'payment-methods'],
        queryFn: ({ signal }) => listPaymentMethods(true, signal),
        enabled: paymentMode,
    })

    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [registeredPayments, setRegisteredPayments] = useState<RegisteredPayment[]>([])

    useEffect(() => {
        setOnOrderClosed(() => {
            handleClosePaymentModal()
            handleResetPaymentSelection()
            setOrder(null)
            setCartItems([])
            toast.success('La orden fue cerrada por otro usuario')
            setTimeout(() => router.push('/pos/tables'), 1200)
        })
    }, [
        setOnOrderClosed,
        setOrder,
        setCartItems,
        handleClosePaymentModal,
        handleResetPaymentSelection,
        router,
    ])

    const filteredProducts = selectedCategory
        ? products.filter((product) => product.categoryId === selectedCategory)
        : []

    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)

    const productQuantities = useMemo(() => {
        const map: Record<string, number> = {}
        for (const item of cartItems) {
            map[item.productId] = (map[item.productId] ?? 0) + item.quantity
        }
        return map
    }, [cartItems])
    const totalPaid = registeredPayments.reduce((sum, payment) => sum + payment.amount, 0)

    const registerPayment = (method: PaymentMethodDto, amount: number, label: string) => {
        setRegisteredPayments((prev) => [
            ...prev,
            {
                paymentMethodId: method.id,
                methodName: method.name,
                methodCode: method.code,
                amount,
            },
        ])
        handleResetPaymentSelection()
        toast.success(`${label}: ${formatCurrency(amount)}`)
    }

    const handleCancelOrderWithConfirm = async () => {
        if (!order) return

        const confirmed = await showConfirmation({
            title: 'Cancelar orden',
            message: `Estás a punto de cancelar la orden de la mesa ${table?.number ?? order?.tableName ?? ''}.\n\nEsta acción:\n• Marcará la orden como cancelada\n• Preservará todos los items para referencia\n• No se puede deshacer\n\n¿Deseas continuar?`,
            confirmText: 'Cancelar orden',
            cancelText: 'Volver',
            confirmButtonClass: 'bg-danger hover:bg-danger/90',
        })

        if (!confirmed) return

        try {
            await handleCancelOrder()
            toast.success('Orden cancelada correctamente')
            setTimeout(() => router.push('/pos/tables'), 800)
        } catch (error) {
            toast.error(getErrorMessage(error, 'Error al cancelar la orden'))
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
        } catch (error) {
            toast.error(getErrorMessage(error, 'Error finalizando el pago'))
        }
    }

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Spinner className="size-6" />
                    <p className="text-sm text-muted-foreground">Cargando orden...</p>
                </div>
            </div>
        )
    }

    const tableLabel = table?.number ?? order?.tableName ?? tableId.slice(0, 8)

    if (!table && !order) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background p-6">
                <EmptyState
                    icon={<UtensilsCrossed />}
                    title="Mesa no encontrada"
                    description="La mesa solicitada no existe o fue desactivada."
                />
            </div>
        )
    }

    const selectedMethod = paymentMethods.find(
        (method) => method.id === selectedPaymentMethod,
    )

    return (
        <div className="flex h-full w-full flex-col overflow-hidden bg-background">
            <div className="flex flex-1 overflow-hidden">
                <div className="flex w-2/5 min-w-0 flex-col overflow-hidden border-r border-border bg-surface">
                    <div className="shrink-0 border-b border-border bg-surface-muted px-4 py-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                {!order && (
                                    <Button
                                        size="sm"
                                        onClick={() => void handleOpenOrder()}
                                    >
                                        <Plus />
                                        Abrir
                                    </Button>
                                )}
                                <h2 className="font-bold text-foreground">
                                    Mesa {tableLabel}
                                </h2>
                            </div>

                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => router.push('/pos/tables')}
                                title="Volver a mesas"
                            >
                                <ArrowLeft />
                                Mesas
                            </Button>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                                Orden: {order?.orderNumber || 'N/A'} |{' '}
                                {order ? `Estado: ${order.status}` : 'Sin orden'}
                            </p>
                            {order?.createdByName && (
                                <p className="text-xs text-muted-foreground">
                                    Iniciada por: {order.createdByName}
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
                            <CartSummary
                                subtotal={subtotal}
                                paymentMode={paymentMode}
                                totalPaid={totalPaid}
                                orderId={order.id}
                                orderNumber={order.orderNumber}
                                onCancelOrder={handleCancelOrderWithConfirm}
                                onStartPayment={handleOpenPaymentModal}
                                onFinalizePayment={handleFinalizePay}
                            />
                        </>
                    ) : (
                        <div className="flex flex-1 items-center justify-center overflow-y-auto bg-surface-muted p-6">
                            <EmptyState
                                icon={<UtensilsCrossed />}
                                title="Sin orden abierta"
                                description="Abre una orden para comenzar a agregar productos."
                                action={
                                    <Button onClick={() => void handleOpenOrder()}>
                                        <Plus />
                                        Abrir orden
                                    </Button>
                                }
                            />
                        </div>
                    )}
                </div>

                <div className="flex w-1/6 min-w-0 flex-col overflow-hidden border-r border-border bg-surface-muted">
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

                <div className="min-w-0 flex-1 overflow-hidden bg-surface">
                    {paymentMode ? (
                        selectedMethod ? (
                            <>
                                {selectedMethod.code === 'CASH' && (
                                    <CashPaymentForm
                                        total={order?.total || 0}
                                        onSubmit={(data) =>
                                            registerPayment(
                                                selectedMethod,
                                                data.amount,
                                                'Efectivo',
                                            )
                                        }
                                        onBack={handleResetPaymentSelection}
                                    />
                                )}
                                {selectedMethod.code === 'TRANSFER' && (
                                    <TransferPaymentForm
                                        total={order?.total || 0}
                                        onSubmit={(data) =>
                                            registerPayment(
                                                selectedMethod,
                                                data.amount,
                                                'Transferencia',
                                            )
                                        }
                                        onBack={handleResetPaymentSelection}
                                    />
                                )}
                                {selectedMethod.code === 'CARD' && (
                                    <CardPaymentForm
                                        total={order?.total || 0}
                                        onSubmit={(data) =>
                                            registerPayment(
                                                selectedMethod,
                                                data.amount,
                                                'Tarjeta',
                                            )
                                        }
                                        onBack={handleResetPaymentSelection}
                                    />
                                )}
                            </>
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
                                onAddPayment={() => undefined}
                                onFinalize={handleFinalizePay}
                            />
                        )
                    ) : (
                        <ProductCatalog
                            products={filteredProducts.map((product) => ({
                                id: product.id,
                                name: product.name,
                                categoryName: product.categoryName,
                                price: product.price,
                            }))}
                            quantities={productQuantities}
                            onAddProduct={(product) => {
                                const fullProduct = filteredProducts.find(
                                    (item) => item.id === product.id,
                                )
                                if (fullProduct) {
                                    void handleAddProduct(fullProduct, user)
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            {ConfirmDialogComponent}
        </div>
    )
}

export default PosOrderPage
