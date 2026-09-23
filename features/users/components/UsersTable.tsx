'use client'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
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
import type { PaginatedUsersResponse, UserResponse } from '../api'

const ROLE_LABELS: Record<string, string> = {
    ADMINISTRATOR: 'Administrador',
    MANAGER: 'Gerente',
    CASHIER: 'Cajero',
    WAITER: 'Mesero',
}

type RoleBadgeVariant = 'danger' | 'warning' | 'info' | 'success'

function roleBadgeVariant(role: string): RoleBadgeVariant {
    switch (role) {
        case 'ADMINISTRATOR':
            return 'danger'
        case 'MANAGER':
            return 'warning'
        case 'CASHIER':
            return 'info'
        default:
            return 'success'
    }
}

interface UsersTableProps {
    users: PaginatedUsersResponse
    onEdit: (user: UserResponse) => void
    onDelete: (user: UserResponse) => void
    onResetPassword: (user: UserResponse) => void
}

export function UsersTable({
    users,
    onEdit,
    onDelete,
    onResetPassword,
}: UsersTableProps) {
    return (
        <TableWrapper>
            <Table>
                <THead>
                    <Tr>
                        <Th>Nombre</Th>
                        <Th>Email</Th>
                        <Th>Rol</Th>
                        <Th>Estado</Th>
                        <Th className="text-right">Acciones</Th>
                    </Tr>
                </THead>
                <TBody>
                    {users.data.map((user) => (
                        <Tr key={user.id}>
                            <Td className="font-medium text-foreground">
                                {user.name}
                            </Td>
                            <Td className="text-muted-foreground">
                                {user.email}
                            </Td>
                            <Td>
                                <Badge variant={roleBadgeVariant(user.role)}>
                                    {ROLE_LABELS[user.role] ?? user.role}
                                </Badge>
                            </Td>
                            <Td>
                                <Badge
                                    variant={user.isActive ? 'success' : 'danger'}
                                >
                                    {user.isActive ? 'Activo' : 'Inactivo'}
                                </Badge>
                            </Td>
                            <Td>
                                <div className="flex justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onEdit(user)}
                                    >
                                        <Pencil />
                                        Editar
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onResetPassword(user)}
                                    >
                                        <KeyRound />
                                        Restablecer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-danger hover:bg-danger/10"
                                        onClick={() => onDelete(user)}
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
