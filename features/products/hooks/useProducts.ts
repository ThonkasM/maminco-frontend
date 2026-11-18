'use client'
import { useMemo, useState } from 'react'
import { useMutation, keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    createProduct,
    deleteProductImage,
    uploadProductImage,
    deleteProduct,
    getProducts,
    updateProduct,
    type CreateProductPayload,
} from '../api'
import { getActiveCategories } from '@/features/categories/api'
import { STALE_TIME } from '@/lib/query/staleTimes'

const KEYS = {
    all: ['products'] as const,
    activeCategories: ['categories', 'active'] as const,
}

export type ImageChange = { file: File } | { remove: true }

async function applyImage(productId: string, image?: ImageChange) {
    if (!image) return
    if ('file' in image) await uploadProductImage(productId, image.file)
    else await deleteProductImage(productId)
}

export function useProducts() {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: [...KEYS.all, { page, search, categoryFilter }],
        placeholderData: keepPreviousData,
        staleTime: STALE_TIME.catalog,
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
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getActiveCategories(signal),
    })

    const namesQuery = useQuery({
        queryKey: [...KEYS.all, 'names'],
        staleTime: STALE_TIME.catalog,
        queryFn: ({ signal }) => getProducts(1, 1000, undefined, undefined, signal),
    })

    const invalidate = () => queryClient.invalidateQueries({ queryKey: KEYS.all })

    const createMutation = useMutation({
        mutationFn: async ({ payload, image }: { payload: CreateProductPayload; image?: ImageChange }) => {
            const product = await createProduct(payload)
            await applyImage(product.id, image)
            return product
        },
        onSuccess: async () => {
            toast.success('Producto creado correctamente')
            setPage(1)
            await invalidate()
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando producto')),
    })

    const updateMutation = useMutation({
        mutationFn: async ({
            id,
            payload,
            image,
        }: {
            id: string
            payload: CreateProductPayload
            image?: ImageChange
        }) => {
            const product = await updateProduct(id, payload)
            await applyImage(id, image)
            return product
        },
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
        createNewProduct: async (payload: CreateProductPayload, image?: ImageChange) => {
            try {
                await createMutation.mutateAsync({ payload, image })
                return true
            } catch {
                return false
            }
        },
        updateExistingProduct: async (
            id: string,
            payload: CreateProductPayload,
            image?: ImageChange,
        ) => {
            try {
                await updateMutation.mutateAsync({ id, payload, image })
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
