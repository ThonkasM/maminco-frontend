'use client'
import { History } from 'lucide-react'
import {
    EmptyState,
    Skeleton,
    Table,
    TableWrapper,
    TBody,
    Td,
    Th,
    THead,
    Tr,
} from '@/components/ui'
import type { OrderHistoryTimelineEntry } from '../api'
import { OrderActionIcon } from './OrderActionIcon'

interface OrderHistoryTableProps {
    history: OrderHistoryTimelineEntry[]
    isLoading?: boolean
}

export function OrderHistoryTable({
    history,
    isLoading = false,
}: OrderHistoryTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </div>
        )
    }

    if (!history || history.length === 0) {
        return (
            <EmptyState
                icon={<History />}
                title="Sin historial"
                description="No hay registros de auditoría para esta orden."
            />
        )
    }

    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Hora</Th>
                        <Th>Acción</Th>
                        <Th>Usuario</Th>
                        <Th>Descripción</Th>
                    </Tr>
                </THead>
                <TBody>
                    {history.map((entry, index) => (
                        <Tr key={entry.id || index}>
                            <Td className="whitespace-nowrap text-muted-foreground">
                                {entry.timestamp}
                            </Td>
                            <Td className="whitespace-nowrap">
                                <span className="flex items-center gap-2">
                                    <OrderActionIcon action={entry.action} />
                                    <span className="font-medium text-foreground">
                                        {entry.action}
                                    </span>
                                </span>
                            </Td>
                            <Td className="whitespace-nowrap text-muted-foreground">
                                {entry.user}
                            </Td>
                            <Td className="max-w-xs text-muted-foreground">
                                <span
                                    className="block truncate"
                                    title={entry.detail || entry.description}
                                >
                                    {entry.detail || entry.description || '—'}
                                </span>
                            </Td>
                        </Tr>
                    ))}
                </TBody>
            </Table>
        </TableWrapper>
    )
}
