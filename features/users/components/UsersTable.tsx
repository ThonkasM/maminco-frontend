'use client'
import { KeyRound, Pencil, Trash2 } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, DataTable } from '@/components/ui'
import type { PaginatedUsersResponse, UserResponse } from '../api'

const ROLE_LABELS: Record<string, string> = {
    ADMINISTRATOR: 'Administrador',
    MANAGER: 'Gerente',
    CASHIER: 'Cajero',
    WAITER: 'Mesero',
    COOK: 'Cocinero',
}

type RoleBadgeVariant = 'danger' | 'warning' | 'info' | 'success' | 'brand'

function roleBadgeVariant(role: string): RoleBadgeVariant {
    switch (role) {
        case 'ADMINISTRATOR':
            return 'danger'
        case 'MANAGER':
            return 'warning'
        case 'CASHIER':
            return 'info'
        case 'COOK':
            return 'brand'
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
    const columns: ColumnDef<UserResponse>[] = [
        {
            accessorKey: 'name',
            header: 'Nombre',
            cell: ({ row }) => (
                <span className="font-medium text-foreground">
                    {row.original.name}
                </span>
            ),
        },
        {
            accessorKey: 'email',
            header: 'Email',
            cell: ({ row }) => (
                <span className="text-muted-foreground">
                    {row.original.email}
                </span>
            ),
        },
        {
            id: 'role',
            header: 'Rol',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={roleBadgeVariant(row.original.role)}>
                    {ROLE_LABELS[row.original.role] ?? row.original.role}
                </Badge>
            ),
        },
        {
            id: 'status',
            header: 'Estado',
            enableSorting: false,
            cell: ({ row }) => (
                <Badge variant={row.original.isActive ? 'success' : 'danger'}>
                    {row.original.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
            ),
        },
        {
            id: 'actions',
            header: 'Acciones',
            enableSorting: false,
            meta: { align: 'right' },
            cell: ({ row }) => (
                <div className="flex justify-end gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(row.original)}
                    >
                        <Pencil />
                        Editar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onResetPassword(row.original)}
                    >
                        <KeyRound />
                        Restablecer
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-danger hover:bg-danger/10"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2 />
                        Desactivar
                    </Button>
                </div>
            ),
        },
    ]

    return (
        <DataTable
            columns={columns}
            data={users.data}
            getRowId={(user) => user.id}
        />
    )
}
