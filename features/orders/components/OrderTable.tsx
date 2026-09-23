'use client'
import { Eye } from 'lucide-react'
import {
    Badge,
    Button,
    Table,
    TableWrapper,
    TBody,
    Td,
    Th,
    THead,
    Tr,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type {
    OrderResponseDto,
    OrderStatus,
    PaginatedOrdersResponse,
    ServiceType,
} from '../api'

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

const SERVICE_TYPE_LABELS: Record<string, string> = {
    MESA: 'Salón',
    SALON: 'Salón',
    EXTERIOR: 'Exterior',
    DELIVERY: 'Delivery',
    RECOGER: 'Para recoger',
}

function serviceTypeVariant(
    serviceType: ServiceType,
): 'neutral' | 'warning' | 'brand' {
    switch (serviceType) {
        case 'MESA':
            return 'brand'
        case 'DELIVERY':
            return 'warning'
        default:
            return 'neutral'
    }
}

interface OrderTableProps {
    orders: PaginatedOrdersResponse
    onViewDetail: (order: OrderResponseDto) => void
}

export function OrderTable({ orders, onViewDetail }: OrderTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Orden</Th>
                        <Th>Mesa</Th>
                        <Th>Tipo</Th>
                        <Th>Items</Th>
                        <Th>Total</Th>
                        <Th>Estado</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {orders.data.map((order) => (
                        <Tr key={order.id}>
                            <Td className="font-medium text-foreground">
                                {order.orderNumber}
                            </Td>
                            <Td className="text-muted-foreground">
                                {order.tableName || '—'}
                            </Td>
                            <Td>
                                <Badge
                                    variant={serviceTypeVariant(
                                        order.serviceType,
                                    )}
                                >
                                    {SERVICE_TYPE_LABELS[order.serviceType] ??
                                        order.serviceType}
                                </Badge>
                            </Td>
                            <Td className="text-muted-foreground">
                                {order.itemCount}
                            </Td>
                            <Td className="font-medium text-foreground">
                                {formatCurrency(Number(order.total))}
                            </Td>
                            <Td>
                                <Badge variant={STATUS_VARIANTS[order.status]}>
                                    {STATUS_LABELS[order.status] ?? order.status}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onViewDetail(order)}
                                    >
                                        <Eye />
                                        Ver
                                    </Button>
                                </div>
                            </Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
        </TableWrapper>
    )
}
