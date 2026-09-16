import { useState, useEffect } from 'react'
import { getAreas, createArea, updateArea, deleteArea, PaginatedAreasResponse, AreaResponse, CreateAreaPayload } from '@/lib/api/admin/areas'
import { toast } from '@/components/ToastProvider'

export function useAreas() {
    const [areas, setAreas] = useState<PaginatedAreasResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [existingNames, setExistingNames] = useState<Set<string>>(new Set())

    // Auto-load on page or search change
    useEffect(() => {
        loadAreas()
    }, [page, search])

    const loadAreas = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getAreas(page, 10, search)
            setAreas(data)
            setExistingNames(new Set(data.data.map((a) => a.name)))
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando áreas'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async (formData: CreateAreaPayload) => {
        try {
            await createArea(formData)
            toast.success('Área creada correctamente')
            await loadAreas()
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando área'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleUpdate = async (id: string, formData: CreateAreaPayload) => {
        try {
            await updateArea(id, formData)
            toast.success('Área actualizada correctamente')
            await loadAreas()
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando área'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteArea(id)
            toast.success(`Área ${name} desactivada correctamente`)
            await loadAreas()
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando área'
            toast.error(errorMsg)
            throw err
        }
    }

    return {
        areas,
        loading,
        error,
        page,
        search,
        existingNames,
        setPage,
        setSearch,
        loadAreas,
        handleCreate,
        handleUpdate,
        handleDelete,
    }
}
