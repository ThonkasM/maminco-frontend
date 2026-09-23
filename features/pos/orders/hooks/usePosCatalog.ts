'use client'
import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/features/categories/api'
import { getProducts } from '@/features/products/api'

export function usePosCatalog() {
    const categoriesQuery = useQuery({
        queryKey: ['pos', 'categories'],
        queryFn: ({ signal }) => getCategories(1, 1000, undefined, signal),
    })

    const productsQuery = useQuery({
        queryKey: ['pos', 'products'],
        queryFn: ({ signal }) => getProducts(1, 1000, undefined, undefined, signal),
    })

    return {
        categories: categoriesQuery.data?.data ?? [],
        products: productsQuery.data?.data ?? [],
    }
}
