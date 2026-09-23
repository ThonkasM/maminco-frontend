'use client'
import { useQuery } from '@tanstack/react-query'
import { getActiveCategories } from '@/features/categories/api'
import { getAvailableProducts } from '@/features/products/api'

/**
 * POS catalog: active categories + available products.
 *
 * Uses the public catalog endpoints (`/public/active`, `/public/available`)
 * because staff roles (WAITER/CASHIER) cannot read the admin list endpoints,
 * and the POS should only offer categories/products that are actually orderable.
 */
export function usePosCatalog() {
    const categoriesQuery = useQuery({
        queryKey: ['pos', 'categories'],
        queryFn: ({ signal }) => getActiveCategories(signal),
        staleTime: 60_000,
    })

    const productsQuery = useQuery({
        queryKey: ['pos', 'products'],
        queryFn: ({ signal }) =>
            getAvailableProducts(undefined, undefined, 500, signal),
        staleTime: 60_000,
    })

    return {
        categories: categoriesQuery.data ?? [],
        // Prisma Decimals arrive as strings; normalize so the UI can format/math them.
        products: (productsQuery.data ?? []).map((product) => ({
            ...product,
            price: Number(product.price),
        })),
        loading: categoriesQuery.isLoading || productsQuery.isLoading,
        error: categoriesQuery.error ?? productsQuery.error,
    }
}
