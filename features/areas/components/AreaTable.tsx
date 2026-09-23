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
import type { AreaResponse, PaginatedAreasResponse } from '../api'

interface AreaTableProps {
    areas: PaginatedAreasResponse
    onEdit: (area: AreaResponse) => void
    onDelete: (area: AreaResponse) => void
}

export function AreaTable({ areas, onEdit, onDelete }: AreaTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Descripción</Th>
                        <Th>Tipo</Th>
                        <Th>Mesas</Th>
                        <Th>Estado</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {areas.data.map((area) => (
                        <Tr key={area.id}>
                            <Td className="font-medium text-foreground">{area.name}</Td>
                            <Td className="text-muted-foreground">
                                {area.description || '—'}
                            </Td>
                            <Td>
                                <Badge variant={area.isVirtual ? 'info' : 'neutral'}>
                                    {area.isVirtual ? 'Virtual' : 'Física'}
                                </Badge>
                            </Td>
                            <Td className="text-muted-foreground">{area.tablesCount || 0}</Td>
                            <Td>
                                <Badge variant={area.isActive ? 'success' : 'danger'}>
                                    {area.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(area)}
                                    >
                                        <Pencil />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/10"
                                        onClick={() => onDelete(area)}
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
