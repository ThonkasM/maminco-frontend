'use client'
import { MessageSquare } from 'lucide-react'
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { OrderResponseDto, OrderStatus } from '../api'
import { OrderHistoryTimeline } from './OrderHistoryTimeline'

const STATUS_LABELS: Record<OrderStatus, string> = {
    DRAFT: 'Borrador',
    CLOSED: 'Cerrada',
    CANCELLED: 'Cancelada',
}

const STATUS_VARIANTS: Record<
    OrderStatus,
    'info' | 'success' | 'danger'
> = {
    DRAFT: 'info',
    CLOSED: 'success',
    CANCELLED: 'danger',
}

interface OrderDetailModalProps {
    isOpen: boolean
    order: OrderResponseDto | null
    onClose: () => void
}

export function OrderDetailModal({
    isOpen,
    order,
    onClose,
}: OrderDetailModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
                {order && (
                    <>
                        <DialogHeader>
                            <DialogTitle>
                                Orden #{order.orderNumber}
                            </DialogTitle>
                            <DialogDescription>
                                {order.tableName || 'Sin mesa'} ·{' '}
                                {order.serviceType}
                            </DialogDescription>
                        </DialogHeader>

                        <section className="space-y-3">
                            <h3 className="font-semibold text-foreground">
                                Items ({order.itemCount})
                            </h3>
                            <div className="max-h-48 space-y-2 overflow-y-auto">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-border bg-surface-muted/40 p-3"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <p className="font-medium text-foreground">
                                                    {item.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCurrency(
                                                        Number(item.unitPrice),
                                                    )}{' '}
                                                    × {item.quantity} ={' '}
                                                    <span className="font-semibold text-foreground">
                                                        {formatCurrency(
                                                            Number(item.subtotal),
                                                        )}
                                                    </span>
                                                </p>
                                                {item.notes && (
                                                    <p className="mt-1 flex items-center gap-1 text-xs italic text-muted-foreground">
                                                        <MessageSquare className="size-3" />
                                                        {item.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        {item.addedByName && (
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                Por:{' '}
                                                <span className="font-medium text-foreground">
                                                    {item.addedByName}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-2 rounded-lg border border-border bg-surface-muted/40 p-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                    Subtotal
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatCurrency(Number(order.subtotal))}
                                </span>
                            </div>

                            {order.discountAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-danger">
                                        Descuento
                                    </span>
                                    <span className="font-medium text-danger">
                                        -
                                        {formatCurrency(
                                            Number(order.discountAmount),
                                        )}
                                    </span>
                                </div>
                            )}

                            {order.tipAmount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-success">
                                        Propina
                                    </span>
                                    <span className="font-medium text-success">
                                        +
                                        {formatCurrency(Number(order.tipAmount))}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-between border-t border-border pt-2">
                                <span className="font-semibold text-foreground">
                                    Total
                                </span>
                                <span className="text-lg font-bold text-foreground">
                                    {formatCurrency(Number(order.total))}
                                </span>
                            </div>
                        </section>

                        <section className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Estado
                            </p>
                            <Badge variant={STATUS_VARIANTS[order.status]}>
                                {STATUS_LABELS[order.status] ?? order.status}
                            </Badge>
                        </section>

                        <section className="rounded-lg border border-border bg-surface-muted/30 p-4">
                            <OrderHistoryTimeline
                                orderId={order.id}
                                isOpen={isOpen}
                            />
                        </section>

                        <div className="flex">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={onClose}
                            >
                                Cerrar
                            </Button>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
