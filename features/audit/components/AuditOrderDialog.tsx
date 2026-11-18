'use client'
import { UserRound } from 'lucide-react'
import { Badge, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Skeleton } from '@/components/ui'
import { OrderHistoryTimeline } from '@/features/orders/components/OrderHistoryTimeline'
import { formatCurrency } from '@/lib/utils/currency'
import type { AuditOrder } from '../api'
import { useOrderChanges } from '../hooks'
import { changesLabel, groupHistoryByUser, STATUS_LABELS } from '../lib'

const time = (iso: string) => new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })

export function AuditOrderDialog({ order, onClose }: { order: AuditOrder | null; onClose: () => void }) {
    const changes = useOrderChanges(order?.id ?? null)
    const people = groupHistoryByUser(changes.data?.history ?? [])

    return (
        <Dialog open={Boolean(order)} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
                {order && (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex flex-wrap items-center gap-2">
                                Orden #{order.orderNumber}
                                <Badge variant={order.status === 'CLOSED' ? 'success' : order.status === 'CANCELLED' ? 'danger' : 'warning'}>{STATUS_LABELS[order.status]}</Badge>
                            </DialogTitle>
                            <DialogDescription>
                                {order.tableName}
                                {order.areaName ? ` · ${order.areaName}` : ''} · Total {formatCurrency(order.total)} · Creada por {order.createdByName}
                            </DialogDescription>
                        </DialogHeader>

                        <section aria-label="Quién hizo qué" className="space-y-3">
                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quién hizo qué</h3>
                            {changes.isLoading ? (
                                <Skeleton className="h-24 w-full" />
                            ) : people.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Esta orden no tiene cambios registrados.</p>
                            ) : (
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {people.map((person) => (
                                        <li key={person.id} className="rounded-lg border border-border bg-surface p-3">
                                            <div className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2 font-semibold text-foreground">
                                                    <UserRound className="size-4 text-muted-foreground" aria-hidden="true" />
                                                    {person.name}
                                                </span>
                                                <Badge variant="brand">{changesLabel(person.total)}</Badge>
                                            </div>
                                            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                                                {person.byAction.map((item) => (
                                                    <li key={item.action} className="flex justify-between gap-2">
                                                        <span>{item.label}</span>
                                                        <span className="tabular-nums text-foreground">×{item.count}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {person.firstAt === person.lastAt ? `A las ${time(person.firstAt)}` : `De ${time(person.firstAt)} a ${time(person.lastAt)}`}
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>

                        <OrderHistoryTimeline orderId={order.id} />
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
