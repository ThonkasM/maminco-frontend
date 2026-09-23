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
import type { CategoryResponse, PaginatedCategoriesResponse } from '../api'

interface CategoryTableProps {
    categories: PaginatedCategoriesResponse
    onEdit: (category: CategoryResponse) => void
    onDelete: (category: CategoryResponse) => void
}

export function CategoryTable({
    categories,
    onEdit,
    onDelete,
}: CategoryTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Descripción</Th>
                        <Th>Productos</Th>
                        <Th>Estado</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {categories.data.map((category) => (
                        <Tr key={category.id}>
                            <Td className="font-medium text-foreground">
                                {category.name}
                            </Td>
                            <Td className="text-muted-foreground">
                                {category.description || '—'}
                            </Td>
                            <Td className="text-muted-foreground">
                                {category.productsCount || 0}
                            </Td>
                            <Td>
                                <Badge
                                    variant={category.isActive ? 'success' : 'danger'}
                                >
                                    {category.isActive ? 'Activa' : 'Inactiva'}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(category)}
                                    >
                                        <Pencil />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/10"
                                        onClick={() => onDelete(category)}
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
