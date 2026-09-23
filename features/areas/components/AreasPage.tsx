'use client'
import { Plus } from 'lucide-react'
import { Button, EmptyState, Input, Pagination, Skeleton } from '@/components/ui'
import { useAreas } from '../hooks/useAreas'
import { useAreasUI } from '../hooks/useAreasUI'
import { AreaTable } from './AreaTable'
import { AreaFormModal } from './AreaFormModal'
import { AreaDeleteModal } from './AreaDeleteModal'

export function AreasPage() {
    const {
        areas,
        loading,
        error,
        page,
        search,
        existingNames,
        setPage,
        setSearch,
        handleCreate,
        handleUpdate,
        handleDelete,
    } = useAreas()

    const {
        showModal,
        editingArea,
        showDeleteModal,
        deleteTarget,
        submitting,
        deleteSubmitting,
        handleOpenModal,
        handleCloseModal,
        handleDeleteClick,
        setSubmitting,
        setDeleteSubmitting,
        setShowDeleteModal,
        setDeleteTarget,
    } = useAreasUI()

    const handleSubmit = async (formData: Parameters<typeof handleCreate>[0]) => {
        setSubmitting(true)
        try {
            if (editingArea) {
                await handleUpdate(editingArea.id, formData)
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
            await handleDelete(deleteTarget.id)
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
                        Gestión de áreas
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Administra las áreas del restaurante
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus />
                    Nueva área
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
            ) : areas && areas.data.length > 0 ? (
                <div className="space-y-4">
                    <AreaTable
                        areas={areas}
                        onEdit={(area) => handleOpenModal(area)}
                        onDelete={handleDeleteClick}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {areas.data.length} de {areas.total} áreas
                        </p>
                        <Pagination
                            page={page}
                            totalPages={areas.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No hay áreas"
                    description="Crea la primera área del restaurante para empezar."
                    action={
                        <Button onClick={() => handleOpenModal()}>
                            <Plus />
                            Nueva área
                        </Button>
                    }
                />
            )}

            <AreaFormModal
                open={showModal}
                area={editingArea}
                existingNames={existingNames}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                submitting={submitting}
            />

            {deleteTarget && (
                <AreaDeleteModal
                    open={showDeleteModal}
                    area={deleteTarget}
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
