'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    createCategory,
    deleteCategory,
    getCategories,
    updateCategory,
    type CreateCategoryPayload,
    type UpdateCategoryPayload,
} from '../api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = { all: ['categories'] as const }

export function useCategories() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, search }],
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getCategories(page, 10, search || undefined, signal),
    })

    const namesQuery = useQuery({
        queryKey: [...KEYS.all, 'names'],
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getCategories(1, 1000, undefined, signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: (payload: CreateCategoryPayload) => createCategory(payload),
        onSuccess: async () => {
            toast.success('Categoría creada correctamente')
            setPage(1)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando categoría')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: UpdateCategoryPayload
        }) => updateCategory(id, payload),
        onSuccess: async () => {
            toast.success('Categoría actualizada correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error actualizando categoría')),
    })

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string; name: string }) => deleteCategory(id),
        onSuccess: async (_data, variables) => {
            toast.success(`Categoría "${variables.name}" desactivada correctamente`)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error desactivando categoría')),
    })

    return {
        categories: query.data ?? null,
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando categorías')
            : null,
        page,
        search,
        existingNames: useMemo(
            () =>
                new Set(
                    (namesQuery.data?.data ?? []).map((category) =>
                        category.name.toLowerCase(),
                    ),
                ),
            [namesQuery.data],
        ),
        setPage,
        setSearch,
        loadCategories: () => {
            void query.refetch()
        },
        loadCategoryNames: (_excludeId?: string) => {
            void namesQuery.refetch()
        },
        handleCreate: (payload: CreateCategoryPayload) =>
            createMutation.mutateAsync(payload),
        handleUpdate: (id: string, payload: CreateCategoryPayload) =>
            updateMutation.mutateAsync({ id, payload }),
        handleDelete: (id: string, name: string) =>
            deleteMutation.mutateAsync({ id, name }),
    }
}
