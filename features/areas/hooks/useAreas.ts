'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    createArea,
    deleteArea,
    getAreas,
    updateArea,
    type CreateAreaPayload,
} from '../api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = { all: ['areas'] as const }

export function useAreas() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, search }],
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getAreas(page, 10, search || undefined, signal),
    })

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: (payload: CreateAreaPayload) => createArea(payload),
        onSuccess: async () => {
            toast.success('Área creada correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando área')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: CreateAreaPayload
        }) => updateArea(id, payload),
        onSuccess: async () => {
            toast.success('Área actualizada correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error actualizando área')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteArea(id),
        onSuccess: async () => {
            toast.success('Área desactivada correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error desactivando área')),
    })

    return {
        areas: query.data ?? null,
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando áreas')
            : null,
        page,
        search,
        existingNames: useMemo(
            () => new Set((query.data?.data ?? []).map((area) => area.name)),
            [query.data],
        ),
        setPage,
        setSearch,
        loadAreas: () => {
            void query.refetch()
        },
        handleCreate: (payload: CreateAreaPayload) =>
            createMutation.mutateAsync(payload),
        handleUpdate: (id: string, payload: CreateAreaPayload) =>
            updateMutation.mutateAsync({ id, payload }),
        handleDelete: (id: string) => deleteMutation.mutateAsync(id),
    }
}
