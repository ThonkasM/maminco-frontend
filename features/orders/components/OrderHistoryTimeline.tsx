'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History, RefreshCw } from 'lucide-react'
import { Badge, Button } from '@/components/ui'
import { getErrorMessage } from '@/lib/utils/errors'
import { getOrderHistoryTimeline } from '../api'
import { OrderHistoryTable } from './OrderHistoryTable'

interface OrderHistoryTimelineProps {
    orderId: string
    isOpen?: boolean
}

export function OrderHistoryTimeline({
    orderId,
    isOpen = true,
}: OrderHistoryTimelineProps) {
    const [page, setPage] = useState(1)

    const query = useQuery({
        queryKey: ['orders', orderId, 'timeline', page],
        queryFn: ({ signal }) =>
            getOrderHistoryTimeline(orderId, page, 50, signal),
        enabled: isOpen,
    })

    const pagination = query.data?.pagination

    if (query.error) {
        return (
            <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                {getErrorMessage(query.error, 'Error cargando el historial')}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <History className="size-4" />
                    Historial de auditoría
                    <Badge variant="neutral">
                        {pagination?.total ?? 0} total
                    </Badge>
                </h3>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void query.refetch()}
                    disabled={query.isFetching}
                >
                    <RefreshCw />
                    Actualizar
                </Button>
            </div>

            <OrderHistoryTable
                history={query.data?.timeline ?? []}
                isLoading={query.isLoading}
            />

            {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-surface-muted/40 p-3">
                    <p className="text-xs text-muted-foreground">
                        Página {pagination.page} de {pagination.totalPages} (
                        {pagination.total} registros)
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => prev - 1)}
                            disabled={!pagination.hasPreviousPage}
                        >
                            Anterior
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage((prev) => prev + 1)}
                            disabled={!pagination.hasNextPage}
                        >
                            Siguiente
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
