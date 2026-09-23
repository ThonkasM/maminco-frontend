import { Pencil, Trash2 } from 'lucide-react'
import {
    TableWrapper,
    Table,
    THead,
    TBody,
    Tr,
    Th,
    Td,
    Badge,
    Button,
} from '@/components/ui'
import type { BadgeProps } from '@/components/ui'
import type {
    PaginatedTablesResponse,
    TableResponse,
    TableStatus,
} from '../api'

interface TableTableProps {
    tables: PaginatedTablesResponse
    onEdit: (table: TableResponse) => void
    onDelete: (table: TableResponse) => void
    onStatusChange: (table: TableResponse) => void
}

const statusLabels: Record<TableStatus, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
}

const statusVariants: Record<TableStatus, BadgeProps['variant']> = {
    AVAILABLE: 'success',
    OCCUPIED: 'danger',
    RESERVED: 'warning',
}

export function TableTable({
    tables,
    onEdit,
    onDelete,
    onStatusChange,
}: TableTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>#</Th>
                        <Th>Área</Th>
                        <Th>Estado</Th>
                        <Th>Pedidos</Th>
                        <Th>Activa</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {tables.data.map((table) => (
                        <Tr key={table.id}>
                            <Td className="font-medium text-foreground">
                                #{table.number}
                            </Td>
                            <Td className="text-muted-foreground">
                                {table.areaName || '—'}
                            </Td>
                            <Td>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0"
                                    onClick={() => onStatusChange(table)}
                                    title="Cambiar estado"
                                >
                                    <Badge variant={statusVariants[table.status]}>
                                        {statusLabels[table.status]}
                                    </Badge>
                                </Button>
                            </Td>
                            <Td className="text-muted-foreground">
                                {table.ordersCount || 0}
                            </Td>
                            <Td>
                                <Badge
                                    variant={table.isActive ? 'success' : 'danger'}
                                >
                                    {table.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(table)}
                                    >
                                        <Pencil />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/10"
                                        onClick={() => onDelete(table)}
                                    >
                                        <Trash2 />
                                        Desactivar
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
