'use client'
import { Eye } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
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
    const columns: ColumnDef<OrderResponseDto>[] = [
        {
            accessorKey: 'orderNumber',
            header: 'Orden',
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {row.original.orderNumber}
                </span>
            ),
        },
        {
            accessorKey: 'tableName',
            header: 'Mesa',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.tableName || '—'}
                </span>
            ),
        },
        {
            id: 'serviceType',
            header: 'Tipo',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={serviceTypeVariant(row.original.serviceType)}>
                    {SERVICE_TYPE_LABELS[row.original.serviceType] ??
                        row.original.serviceType}
                </Badge>
            ),
        },
        {
            accessorKey: 'itemCount',
            header: 'Items',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.itemCount}
                </span>
            ),
        },
        {
            id: 'total',
            header: 'Total',
            accessorFn: (row) => Number(row.total),
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {formatCurrency(Number(row.original.total))}
                </span>
            ),
        },
        {
            id: 'status',
            header: 'Estado',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={STATUS_VARIANTS[row.original.status]}>
                    {STATUS_LABELS[row.original.status] ?? row.original.status}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            enableSorting: false,
            meta: { align: 'right' },
            cell: ({ row }) => (
                <div className="flex justify-end">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(row.original)}
                    >
                        <Eye />
                        Ver
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={orders.data}
            getRowId={(order) => order.id}
        />
    )
}
