'use client'
import { useState } from 'react'
import { ClipboardList, Eye } from 'lucide-react'
import {
    Button,
    Card,
    CardContent,
    EmptyState,
    Label,
    Pagination,
    Select,
    Skeleton,
} from '@/components/ui'
import type { OrderResponseDto, OrderStatus } from '../api'
import { useOrders } from '../hooks/useOrders'
import { OrderTable } from './OrderTable'
import { OrderDetailModal } from './OrderDetailModal'

export function OrdersPage() {
    const {
        orders,
        tables,
        loading,
        page,
        statusFilter,
        tableFilter,
        serviceTypeFilter,
        setPage,
        setStatusFilter,
        setTableFilter,
        setServiceTypeFilter,
    } = useOrders()

    const [selectedOrder, setSelectedOrder] =
        useState<OrderResponseDto | null>(null)
    const [showOrderDetail, setShowOrderDetail] = useState(false)

    const handleViewOrder = (order: OrderResponseDto) => {
        setSelectedOrder(order)
        setShowOrderDetail(true)
    }

    const handleCloseDetail = () => {
        setShowOrderDetail(false)
        setSelectedOrder(null)
    }

    const handleClearFilters = () => {
        setStatusFilter('')
        setTableFilter('')
        setServiceTypeFilter('')
        setPage(1)
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                    Órdenes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Consulta y filtra las órdenes del restaurante
                </p>
            </div>

            <Card>
                <CardContent className="grid grid-cols-1 gap-4 p-4 md:grid-cols-4">
                    <div className="space-y-2">
                        <Label htmlFor="statusFilter">Estado</Label>
                        <Select
                            id="statusFilter"
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(
                                    e.target.value as OrderStatus | '',
                                )
                                setPage(1)
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="DRAFT">Borrador</option>
                            <option value="CLOSED">Cerrada</option>
                            <option value="CANCELLED">Cancelada</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="serviceTypeFilter">
                            Tipo de servicio
                        </Label>
                        <Select
                            id="serviceTypeFilter"
                            value={serviceTypeFilter}
                            onChange={(e) => {
                                setServiceTypeFilter(e.target.value)
                                setPage(1)
                            }}
                        >
                            <option value="">Todos</option>
                            <option value="MESA">Salón</option>
                            <option value="EXTERIOR">Exterior</option>
                            <option value="DELIVERY">Delivery</option>
                            <option value="RECOGER">Para recoger</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="tableFilter">Mesa</Label>
                        <Select
                            id="tableFilter"
                            value={tableFilter}
                            onChange={(e) => {
                                setTableFilter(e.target.value)
                                setPage(1)
                            }}
                        >
                            <option value="">Todas</option>
                            {tables.map((table) => (
                                <option key={table.id} value={table.id}>
                                    Mesa {table.number}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className="flex items-end">
                        <Button
                            variant="secondary"
                            className="w-full"
                            onClick={handleClearFilters}
                        >
                            Limpiar filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : orders && orders.data.length > 0 ? (
                <div className="space-y-4">
                    <OrderTable
                        orders={orders}
                        onViewDetail={handleViewOrder}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {orders.data.length} de {orders.total}{' '}
                            órdenes
                        </p>
                        <Pagination
                            page={page}
                            totalPages={orders.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<ClipboardList />}
                    title="No hay órdenes"
                    description="No se encontraron órdenes con los filtros seleccionados."
                    action={
                        <Button variant="secondary" onClick={handleClearFilters}>
                            <Eye />
                            Limpiar filtros
                        </Button>
                    }
                />
            )}

            <OrderDetailModal
                isOpen={showOrderDetail}
                order={selectedOrder}
                onClose={handleCloseDetail}
            />
        </div>
    )
}
