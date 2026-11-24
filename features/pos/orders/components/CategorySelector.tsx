'use client'

import React from 'react'
import { Grid3x3 } from 'lucide-react'
import { Button, EmptyState } from '@/components/ui'

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
        .filter((category) => category.isActive !== false)
        .sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div className="flex flex-col overflow-hidden bg-surface md:h-full">
            <div className="hidden shrink-0 border-b border-border bg-surface-muted p-4 md:block">
                <div className="mb-1 flex items-center gap-2">
                    <Grid3x3 className="size-4 text-muted-foreground" />
                    <h3 className="text-sm font-bold uppercase tracking-wide text-foreground">
                        Categorías
                    </h3>
                </div>
                <p className="text-xs text-muted-foreground">
                    {activeCategories.length} disponible
                    {activeCategories.length !== 1 ? 's' : ''}
                </p>
            </div>

            <div className="flex gap-2 overflow-x-auto p-2 md:flex-1 md:flex-col md:overflow-y-auto md:overflow-x-hidden md:p-4">
                {activeCategories.length === 0 ? (
                    <EmptyState
                        icon={<Grid3x3 />}
                        title="Sin categorías disponibles"
                        description="Crea categorías en el panel de gestión."
                    />
                ) : (
                    activeCategories.map((category) => (
                        <Button
                            key={category.id}
                            variant={
                                selectedCategoryId === category.id
                                    ? 'primary'
                                    : 'secondary'
                            }
                            onClick={() => !loading && onSelectCategory(category.id)}
                            disabled={loading}
                            className="h-auto shrink-0 justify-start p-3 text-left md:w-full"
                        >
                            <span className="text-sm font-semibold">
                                {category.name}
                            </span>
                        </Button>
                    ))
                )}
            </div>
        </div>
    )
}

export default CategorySelector
