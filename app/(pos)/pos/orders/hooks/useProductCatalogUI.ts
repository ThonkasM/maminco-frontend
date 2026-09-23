import { useState, useMemo } from 'react'
import { ProductResponse } from '@/lib/api/admin/products'

interface UseProductCatalogUIReturn {
    // Estado
    selectedCategory: string

    // Computed
    filteredProducts: ProductResponse[]

    // Handlers
    handleSelectCategory: (categoryId: string) => void

    // Setters para comunicación con componente padre
    setSelectedCategory: (categoryId: string) => void
}

/**
 * Hook que gestiona TODO el estado UI del catálogo de productos en ordenes-negocio
 * Responsabilidades:
 * - Selección de categoría actual
 * - Filtrado de productos según categoría seleccionada
 * - Handlers de cambio de categoría
 */
export function useProductCatalogUI(products: ProductResponse[]): UseProductCatalogUIReturn {
    const [selectedCategory, setSelectedCategory] = useState<string>('')

    // Computed: Productos filtrados según categoría seleccionada
    const filteredProducts = useMemo(() => {
        if (selectedCategory) {
            return products.filter((p) => p.categoryId === selectedCategory)
        }
        return products
    }, [selectedCategory, products])

    const handleSelectCategory = (categoryId: string) => {
        setSelectedCategory(categoryId)
    }

    return {
        selectedCategory,
        filteredProducts,
        handleSelectCategory,
        setSelectedCategory,
    }
}
