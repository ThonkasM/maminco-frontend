'use client'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    changeTableStatus,
    createTable,
    deleteTable,
    getTables,
    updateTable,
    type CreateTablePayload,
    type TableStatus,
} from '../api'
import { getActiveAreas } from '@/features/areas/api'
import { STALE_TIME } from '@/lib/query/staleTimes'

interface TableFilters {
    areaId: string
    status: TableStatus | ''
}

const KEYS = {
    all: ['tables'] as const,
    activeAreas: ['areas', 'active'] as const,
}

const statusLabels: Record<TableStatus, string> = {
    AVAILABLE: 'disponible',
    OCCUPIED: 'ocupada',
    RESERVED: 'reservada',
}

export function useTables() {
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState<TableFilters>({ areaId: '', status: '' })
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, ...filters }],
        staleTime: STALE_TIME.live,
        queryFn: ({ signal }) =>
            getTables(
                page,
                10,
                {
                    areaId: filters.areaId || undefined,
                    status: filters.status || undefined,
                },
                signal,
            ),
    })

    const areasQuery = useQuery({
        queryKey: KEYS.activeAreas,
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getActiveAreas(signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: (payload: CreateTablePayload) => createTable(payload),
        onSuccess: async () => {
            toast.success('Mesa creada correctamente')
            await invalidate()
        },
        onError: (error) => toast.error(getErrorMessage(error, 'Error creando mesa')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: CreateTablePayload
        }) => updateTable(id, payload),
        onSuccess: async () => {
            toast.success('Mesa actualizada correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error actualizando mesa')),
    })

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string; number: number }) => deleteTable(id),
        onSuccess: async (_data, variables) => {
            toast.success(`Mesa #${variables.number} desactivada correctamente`)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error desactivando mesa')),
    })

    const statusMutation = useMutation({
        mutationFn: ({
            id,
            status,
        }: {
            id: string
            number: number
            status: TableStatus
        }) => changeTableStatus(id, { status }),
        onSuccess: async (_data, variables) => {
            toast.success(
                `Mesa #${variables.number} marcada como ${statusLabels[variables.status]}`,
            )
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error cambiando estado de mesa')),
    })

    return {
        tables: query.data ?? null,
        areas: areasQuery.data ?? [],
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando mesas')
            : null,
        page,
        filters,
        setPage,
        setFilters,
        loadAreas: () => {
            void areasQuery.refetch()
        },
        loadTables: () => {
            void query.refetch()
        },
        handleCreate: (payload: CreateTablePayload) =>
            createMutation.mutateAsync(payload),
        handleUpdate: (id: string, payload: CreateTablePayload) =>
            updateMutation.mutateAsync({ id, payload }),
        handleDelete: (id: string, number: number) =>
            deleteMutation.mutateAsync({ id, number }),
        handleChangeStatus: (id: string, number: number, status: TableStatus) =>
            statusMutation.mutateAsync({ id, number, status }),
    }
}
