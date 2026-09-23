'use client'
import { Plus } from 'lucide-react'
import { Button, EmptyState, Input, Pagination, Skeleton } from '@/components/ui'
import type { CategoryResponse, CreateCategoryPayload } from '../api'
import { useCategories } from '../hooks/useCategories'
import { useCategoriesUI } from '../hooks/useCategoriesUI'
import { CategoryTable } from './CategoryTable'
import { CategoryFormModal } from './CategoryFormModal'
import { CategoryDeleteModal } from './CategoryDeleteModal'

export function CategoriesPage() {
    const {
        categories,
        loading,
        error,
        page,
        search,
        existingNames,
        setPage,
        setSearch,
        loadCategoryNames,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useCategories()

    const {
        showModal,
        editingCategory,
        showDeleteModal,
        deleteTarget,
        submitting,
        deleteSubmitting,
        handleOpenModal: handleUIOpenModal,
        handleCloseModal,
        handleDeleteClick,
        setSubmitting,
        setDeleteSubmitting,
        setShowDeleteModal,
        setDeleteTarget,
    } = useCategoriesUI()

    const handleOpenModal = (category?: CategoryResponse) => {
        handleUIOpenModal(category)
        loadCategoryNames(category?.id)
    }

    const handleSubmit = async (formData: CreateCategoryPayload) => {
        setSubmitting(true)
        try {
            if (editingCategory) {
                await handleUpdate(editingCategory.id, formData)
            } else {
                await handleCreate(formData)
            }
            handleCloseModal()
        } finally {
            setSubmitting(false)
        }
    }

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return
        setDeleteSubmitting(true)
        try {
            await handleDelete(deleteTarget.id, deleteTarget.name)
            setShowDeleteModal(false)
            setDeleteTarget(null)
        } finally {
            setDeleteSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Gestión de categorías
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Administra las categorías de productos
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus />
                    Nueva categoría
                </Button>
            </div>

            <Input
                placeholder="Buscar por nombre..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
            />

            {error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            ) : categories && categories.data.length > 0 ? (
                <div className="space-y-4">
                    <CategoryTable
                        categories={categories}
                        onEdit={(category) => handleOpenModal(category)}
                        onDelete={handleDeleteClick}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {categories.data.length} de {categories.total}{' '}
                            categorías
                        </p>
                        <Pagination
                            page={page}
                            totalPages={categories.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No hay categorías"
                    description="Crea la primera categoría para organizar tus productos."
                    action={
                        <Button onClick={() => handleOpenModal()}>
                            <Plus />
                            Nueva categoría
                        </Button>
                    }
                />
            )}

            <CategoryFormModal
                open={showModal}
                category={editingCategory}
                existingNames={existingNames}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                submitting={submitting}
            />

            {deleteTarget && (
                <CategoryDeleteModal
                    open={showDeleteModal}
                    category={deleteTarget}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        setShowDeleteModal(false)
                        setDeleteTarget(null)
                    }}
                    loading={deleteSubmitting}
                />
            )}
        </div>
    )
}
