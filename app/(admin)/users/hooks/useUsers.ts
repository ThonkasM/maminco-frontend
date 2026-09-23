'use client'
import { useState, useEffect } from 'react'
import {
    getUsers,
    createUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    PaginatedUsersResponse,
    UserResponse,
    CreateUserPayload,
} from '@/lib/api/admin/users'
import { toast } from '@/components/ToastProvider'

export function useUsers() {
    const [users, setUsers] = useState<PaginatedUsersResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [existingEmails, setExistingEmails] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadUsers()
    }, [page, search])

    const loadUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getUsers(page, 10, search)
            setUsers(data)
            setExistingEmails(new Set(data.data.map((u) => u.email)))
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando usuarios'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const createNewUser = async (payload: CreateUserPayload): Promise<boolean> => {
        try {
            await createUser(payload)
            toast.success('Usuario creado correctamente')
            setPage(1)
            await loadUsers()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando usuario'
            toast.error(errorMsg)
            return false
        }
    }

    const updateExistingUser = async (id: string, payload: Omit<CreateUserPayload, 'password'>): Promise<boolean> => {
        try {
            await updateUser(id, payload)
            toast.success('Usuario actualizado correctamente')
            await loadUsers()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando usuario'
            toast.error(errorMsg)
            return false
        }
    }

    const deleteExistingUser = async (id: string, name: string): Promise<boolean> => {
        try {
            await deleteUser(id)
            toast.success(`Usuario ${name} desactivado correctamente`)
            await loadUsers()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando usuario'
            toast.error(errorMsg)
            return false
        }
    }

    const resetPassword = async (id: string, newPassword: string, name: string): Promise<boolean> => {
        try {
            await resetUserPassword(id, newPassword)
            toast.success(`Contraseña reseteada para ${name}`)
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error reseteando contraseña'
            toast.error(errorMsg)
            return false
        }
    }

    return {
        users,
        loading,
        error,
        page,
        search,
        existingEmails,
        setPage,
        setSearch,
        createNewUser,
        updateExistingUser,
        deleteExistingUser,
        resetPassword,
    }
}
