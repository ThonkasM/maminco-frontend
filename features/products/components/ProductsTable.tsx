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
import { formatCurrency } from '@/lib/utils/currency'
import type { PaginatedProductsResponse, ProductResponse } from '../api'

interface ProductsTableProps {
    products: PaginatedProductsResponse
    onEdit: (product: ProductResponse) => void
    onDelete: (product: ProductResponse) => void
    getCategoryName: (categoryId: string) => string
}

export function ProductsTable({
    products,
    onEdit,
    onDelete,
    getCategoryName,
}: ProductsTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Categoría</Th>
                        <Th>Precio</Th>
                        <Th>Estado</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {products.data.map((product) => (
                        <Tr key={product.id}>
                            <Td className="font-medium text-foreground">
                                {product.name}
                            </Td>
                            <Td className="text-muted-foreground">
                                {getCategoryName(product.categoryId)}
                            </Td>
                            <Td className="font-medium text-foreground">
                                {formatCurrency(Number(product.price))}
                            </Td>
                            <Td>
                                <Badge
                                    variant={product.isActive ? 'success' : 'danger'}
                                >
                                    {product.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(product)}
                                    >
                                        <Pencil />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/10"
                                        onClick={() => onDelete(product)}
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
