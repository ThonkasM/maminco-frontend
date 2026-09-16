import { useState, useEffect } from 'react'
import { getTables, createTable, updateTable, deleteTable, changeTableStatus, PaginatedTablesResponse, TableResponse, CreateTablePayload, TableStatus } from '@/lib/api/admin/tables'
import { getActiveAreas, AreaResponse } from '@/lib/api/admin/areas'
import { toast } from '@/components/ToastProvider'

interface TableFilters {
    areaId: string
    status: TableStatus | ''
}

export function useMesas() {
    const [tables, setTables] = useState<PaginatedTablesResponse | null>(null)
    const [areas, setAreas] = useState<AreaResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [filters, setFilters] = useState<TableFilters>({ areaId: '', status: '' })

    // Auto-load on page or filters change
    useEffect(() => {
        loadAreas()
        loadTables()
    }, [page, filters])

    const loadAreas = async () => {
        try {
            const data = await getActiveAreas()
            setAreas(data)
        } catch (err: any) {
            console.error('Error loading areas:', err)
        }
    }

    const loadTables = async () => {
        setLoading(true)
        setError(null)
        try {
            const filterPayload: any = {}
            if (filters.areaId) filterPayload.areaId = filters.areaId
            if (filters.status) filterPayload.status = filters.status

            const data = await getTables(page, 10, filterPayload)
            setTables(data)
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando mesas'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (payload: CreateTablePayload) => {
        try {
            await createTable(payload)
            toast.success('Mesa creada correctamente')
            await loadTables()
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando mesa'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleUpdate = async (id: string, payload: CreateTablePayload) => {
        try {
            await updateTable(id, payload)
            toast.success('Mesa actualizada correctamente')
            await loadTables()
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando mesa'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleDelete = async (id: string, number: number) => {
        try {
            await deleteTable(id)
            toast.success(`Mesa #${number} desactivada correctamente`)
            await loadTables()
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando mesa'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleChangeStatus = async (id: string, number: number, status: TableStatus) => {
        try {
            await changeTableStatus(id, { status })
            const statusLabel = status === 'DISPONIBLE' ? 'disponible' : status === 'OCUPADA' ? 'ocupada' : 'reservada'
            toast.success(`Mesa #${number} marcada como ${statusLabel}`)
            await loadTables()
        } catch (err: any) {
            const errorMsg = err.message || 'Error cambiando estado de mesa'
            toast.error(errorMsg)
            throw err
        }
    }

    return {
        tables,
        areas,
        loading,
        error,
        page,
        filters,
        setPage,
        setFilters,
        loadAreas,
        loadTables,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleChangeStatus,
    }
}
