'use client'
import React from 'react'
import { PaginatedUsersResponse, UserResponse } from '@/lib/api/admin/users'

interface UsersTableProps {
    users: PaginatedUsersResponse
    loading: boolean
    error: string | null
    page: number
    onPageChange: (page: number) => void
    onEdit: (user: UserResponse) => void
    onDelete: (user: UserResponse) => void
    onResetPassword: (user: UserResponse) => void
}

export default function UsersTable({
    users,
    loading,
    error,
    page,
    onPageChange,
    onEdit,
    onDelete,
    onResetPassword,
}: UsersTableProps) {
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMINISTRADOR':
                return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            case 'GERENTE':
                return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
            case 'CAJERO':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
            default:
                return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }
    }

    return (
        <div>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Nombre
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Email
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Rol
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Estado
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.data.map((user) => (
                            <tr
                                key={user.id}
                                className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
                            >
                                <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">
                                    {user.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{user.email}</td>
                                <td className="px-6 py-4 text-sm">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleColor(user.role)}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                            user.isActive
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                    >
                                        {user.isActive ? 'Activo' : 'Inactivo'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => onEdit(user)}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                    >
                                        ✏️ Editar
                                    </button>
                                    <button
                                        onClick={() => onResetPassword(user)}
                                        className="text-purple-600 hover:text-purple-800 font-medium text-sm"
                                    >
                                        🔑 Reset Pass
                                    </button>
                                    <button
                                        onClick={() => onDelete(user)}
                                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                                    >
                                        🗑️ Desactivar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    Mostrando {users.data.length} de {users.total} usuarios
                </p>
                <div className="flex gap-2">
                    <button
                        onClick={() => onPageChange(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        ← Anterior
                    </button>
                    <div className="flex items-center gap-2">
                        {Array.from({ length: users.totalPages }, (_, i) => i + 1).map((p) => (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                    p === page
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => onPageChange(Math.min(users.totalPages, page + 1))}
                        disabled={page === users.totalPages}
                        className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                    >
                        Siguiente →
                    </button>
                </div>
            </div>
        </div>
    )
}
