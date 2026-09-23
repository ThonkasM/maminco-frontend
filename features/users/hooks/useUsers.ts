'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    createUser,
    deleteUser,
    getUsers,
    resetUserPassword,
    updateUser,
    type CreateUserPayload,
    type UpdateUserPayload,
} from '../api'

const KEYS = { all: ['users'] as const }

export function useUsers() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, search }],
        queryFn: ({ signal }) => getUsers(page, 10, search || undefined, signal),
    })

    const emailsQuery = useQuery({
        queryKey: [...KEYS.all, 'emails'],
        queryFn: ({ signal }) => getUsers(1, 1000, undefined, signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: (payload: CreateUserPayload) => createUser(payload),
        onSuccess: async () => {
            toast.success('Usuario creado correctamente')
            setPage(1)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando usuario')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateUserPayload
        }) => updateUser(id, payload),
        onSuccess: async () => {
            toast.success('Usuario actualizado correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error actualizando usuario')),
    })

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string; name: string }) => deleteUser(id),
        onSuccess: async (_data, variables) => {
            toast.success(`Usuario ${variables.name} desactivado correctamente`)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error desactivando usuario')),
    })

    const resetMutation = useMutation({
        mutationFn: ({
            id,
            newPassword,
        }: {
            id: string
            newPassword: string
            name: string
        }) => resetUserPassword(id, newPassword),
        onSuccess: async (_data, variables) => {
            toast.success(`Contraseña reseteada para ${variables.name}`)
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error reseteando contraseña')),
    })

    return {
        users: query.data ?? null,
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando usuarios')
            : null,
        page,
        search,
        existingEmails: useMemo(
            () =>
                new Set(
                    (emailsQuery.data?.data ?? []).map((user) =>
                        user.email.toLowerCase(),
                    ),
                ),
            [emailsQuery.data],
        ),
        setPage,
        setSearch,
        createNewUser: async (payload: CreateUserPayload) => {
            try {
                await createMutation.mutateAsync(payload)
                return true
            } catch {
                return false
            }
        },
        updateExistingUser: async (id: string, payload: UpdateUserPayload) => {
            try {
                await updateMutation.mutateAsync({ id, payload })
                return true
            } catch {
                return false
            }
        },
        deleteExistingUser: async (id: string, name: string) => {
            try {
                await deleteMutation.mutateAsync({ id, name })
                return true
            } catch {
                return false
            }
        },
        resetPassword: async (id: string, newPassword: string, name: string) => {
            try {
                await resetMutation.mutateAsync({ id, newPassword, name })
                return true
            } catch {
                return false
            }
        },
    }
}
