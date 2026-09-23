'use client'
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    createProduct,
    deleteProduct,
    getProducts,
    updateProduct,
    type CreateProductPayload,
} from '../api'
import { getActiveCategories } from '@/features/categories/api'

const KEYS = {
    all: ['products'] as const,
    activeCategories: ['categories', 'active'] as const,
}

export function useProducts() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, search, categoryFilter }],
        queryFn: ({ signal }) =>
            getProducts(
                page,
                10,
                search || undefined,
                categoryFilter || undefined,
                signal,
            ),
    })

    const categoriesQuery = useQuery({
        queryKey: KEYS.activeCategories,
        queryFn: ({ signal }) => getActiveCategories(signal),
    })

    const namesQuery = useQuery({
        queryKey: [...KEYS.all, 'names'],
        queryFn: ({ signal }) => getProducts(1, 1000, undefined, undefined, signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: (payload: CreateProductPayload) => createProduct(payload),
        onSuccess: async () => {
            toast.success('Producto creado correctamente')
            setPage(1)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando producto')),
    })

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string
            payload: CreateProductPayload
        }) => updateProduct(id, payload),
        onSuccess: async () => {
            toast.success('Producto actualizado correctamente')
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error actualizando producto')),
    })

    const deleteMutation = useMutation({
        mutationFn: ({ id }: { id: string; name: string }) => deleteProduct(id),
        onSuccess: async (_data, variables) => {
            toast.success(`Producto "${variables.name}" desactivado correctamente`)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error desactivando producto')),
    })

    const categories = useMemo(
        () => categoriesQuery.data ?? [],
        [categoriesQuery.data],
    )

    return {
        products: query.data ?? null,
        categories,
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando productos')
            : null,
        page,
        search,
        categoryFilter,
        existingNames: useMemo(
            () =>
                new Set(
                    (namesQuery.data?.data ?? []).map((product) =>
                        product.name.toLowerCase(),
                    ),
                ),
            [namesQuery.data],
        ),
        setPage,
        setSearch,
        setCategoryFilter,
        loadProductNames: (_excludeProductId?: string) => {
            void namesQuery.refetch()
        },
        createNewProduct: async (payload: CreateProductPayload) => {
            try {
                await createMutation.mutateAsync(payload)
                return true
            } catch {
                return false
            }
        },
        updateExistingProduct: async (
            id: string,
            payload: CreateProductPayload,
        ) => {
            try {
                await updateMutation.mutateAsync({ id, payload })
                return true
            } catch {
                return false
            }
        },
        deleteExistingProduct: async (id: string, name: string) => {
            try {
                await deleteMutation.mutateAsync({ id, name })
                return true
            } catch {
                return false
            }
        },
        getCategoryName: (categoryId: string) =>
            categories.find((category) => category.id === categoryId)?.name || '—',
    }
}
