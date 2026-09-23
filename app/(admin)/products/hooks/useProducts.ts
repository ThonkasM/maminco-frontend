'use client'
import { useState, useEffect, useCallback } from 'react'
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    PaginatedProductsResponse,
    ProductResponse,
    CreateProductPayload,
} from '@/lib/api/admin/products'
import { getActiveCategories, CategoryResponse } from '@/lib/api/admin/categories'
import { toast } from '@/components/ToastProvider'

export function useProducts() {
    const [products, setProducts] = useState<PaginatedProductsResponse | null>(null)
    const [categories, setCategories] = useState<CategoryResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [existingNames, setExistingNames] = useState<Set<string>>(new Set())

    // Cargar categorías y productos
    useEffect(() => {
        loadCategories()
    }, [])

    useEffect(() => {
        loadProducts()
    }, [page, search, categoryFilter])

    const loadCategories = async () => {
        try {
            const data = await getActiveCategories()
            setCategories(data)
        } catch (err: any) {
            console.error('Error loading categories:', err)
        }
    }

    const loadProducts = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getProducts(page, 10, search || undefined, categoryFilter || undefined)
            setProducts(data)
        } catch (err: any) {
            const errorMsg = err.message || 'Error cargando productos'
            setError(errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const loadProductNames = useCallback(async (excludeProductId?: string) => {
        try {
            const data = await getProducts(1, 1000)
            const names = new Set(
                data.data
                    .filter((p) => !excludeProductId || p.id !== excludeProductId)
                    .map((p) => p.name.toLowerCase())
            )
            setExistingNames(names)
        } catch (err) {
            console.error('Error loading product names:', err)
        }
    }, [])

    const createNewProduct = async (payload: CreateProductPayload): Promise<boolean> => {
        try {
            await createProduct(payload)
            toast.success('Producto creado correctamente')
            setPage(1)
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error creando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const updateExistingProduct = async (id: string, payload: CreateProductPayload): Promise<boolean> => {
        try {
            await updateProduct(id, payload)
            toast.success('Producto actualizado correctamente')
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error actualizando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const deleteExistingProduct = async (id: string, name: string): Promise<boolean> => {
        try {
            await deleteProduct(id)
            toast.success(`Producto "${name}" desactivado correctamente`)
            await loadProducts()
            return true
        } catch (err: any) {
            const errorMsg = err.message || 'Error desactivando producto'
            toast.error(errorMsg)
            return false
        }
    }

    const getCategoryName = (categoryId: string) => {
        return categories.find((c) => c.id === categoryId)?.name || '-'
    }

    return {
        products,
        categories,
        loading,
        error,
        page,
        search,
        categoryFilter,
        existingNames,
        setPage,
        setSearch,
        setCategoryFilter,
        loadProductNames,
        createNewProduct,
        updateExistingProduct,
        deleteExistingProduct,
        getCategoryName,
    }
}
