'use client'

import React from 'react'
import { Grid3x3, ChevronRight } from 'lucide-react'

export interface Category {
    id: string
    name: string
    description?: string
    isActive?: boolean
}

interface CategorySelectorProps {
    categories: Category[]
    selectedCategoryId: string | null
    onSelectCategory: (categoryId: string | null) => void
    loading?: boolean
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategoryId,
    onSelectCategory,
    loading = false,
}) => {
    const activeCategories = categories
        .filter(c => c.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 shrink-0">
                <div className="flex items-center gap-2 mb-1">
                    <Grid3x3 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                        Categorías
                    </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                    {activeCategories.length} disponible{activeCategories.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Categories List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                        <p className="text-sm font-medium">Sin categorías disponibles</p>
                        <p className="text-xs">Crea categorías en el panel de gestión</p>
                    </div>
                ) : (
                    activeCategories.map((category, index) => (
                        <button
                            key={category.id}
                            onClick={() => {
                                console.log('📂 Categoría seleccionada:', {
                                    id: category.id,
                                    name: category.name,
                                })
                                !loading && onSelectCategory(category.id)
                            }}
                            disabled={loading}
                            className={`w-full p-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 border-2 flex items-center justify-between ${
                                selectedCategoryId === category.id
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-700 shadow-lg'
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-sm">
                                    {category.name}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}

export default CategorySelector
