import { useState, useEffect } from 'react'
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    PaginatedCategoriesResponse,
    CategoryResponse,
    CreateCategoryPayload,
} from '@/lib/api/admin/categories'
import { toast } from '@/components/ToastProvider'

export function useCategories() {
    const [categories, setCategories] = useState<PaginatedCategoriesResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [existingNames, setExistingNames] = useState<Set<string>>(new Set())

    // Auto-load on page or search change
    useEffect(() => {
        loadCategories()
    }, [page, search])

    const loadCategories = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getCategories(page, 10, search || undefined)
            setCategories(data)
            setExistingNames(new Set(data.data.map((c) => c.name.toLowerCase())))
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando categorías'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const loadCategoryNames = async (excludeId?: string) => {
        try {
            const data = await getCategories(1, 1000)
            const names = new Set(
                data.data
                    .filter((c) => !excludeId || c.id !== excludeId)
                    .map((c) => c.name.toLowerCase())
            )
            setExistingNames(names)
        } catch (err) {
            console.error('Error loading category names:', err)
        }
    }

    const handleCreate = async (formData: CreateCategoryPayload) => {
        try {
            await createCategory(formData)
            toast.success('Categoría creada correctamente')
            setPage(1)
            await loadCategories()
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando categoría'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleUpdate = async (id: string, formData: CreateCategoryPayload) => {
        try {
            await updateCategory(id, formData)
            toast.success('Categoría actualizada correctamente')
            await loadCategories()
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando categoría'
            toast.error(errorMsg)
            throw err
        }
    }

    const handleDelete = async (id: string, name: string) => {
        try {
            await deleteCategory(id)
            toast.success(`Categoría "${name}" desactivada correctamente`)
            await loadCategories()
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando categoría'
            toast.error(errorMsg)
            throw err
        }
    }

    return {
        categories,
        loading,
        error,
        page,
        search,
        existingNames,
        setPage,
        setSearch,
        loadCategories,
        loadCategoryNames,
        handleCreate,
        handleUpdate,
        handleDelete,
    }
}
