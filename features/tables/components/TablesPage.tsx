'use client'
import { Plus } from 'lucide-react'
import {
    Button,
    EmptyState,
    FormField,
    Pagination,
    Select,
    Skeleton,
} from '@/components/ui'
import type { CreateTablePayload, TableStatus } from '../api'
import { useTables } from '../hooks/useTables'
import { useTablesUI } from '../hooks/useTablesUI'
import { TableTable } from './TableTable'
import { TableFormModal } from './TableFormModal'
import { TableDeleteModal } from './TableDeleteModal'
import { TableStatusModal } from './TableStatusModal'

export function TablesPage() {
    const {
        tables,
        areas,
        loading,
        error,
        page,
        filters,
        setPage,
        setFilters,
        handleCreate,
        handleUpdate,
        handleDelete,
        handleChangeStatus,
    } = useTables()

    const {
        showModal,
        editingTable,
        showDeleteModal,
        deleteTarget,
        showStatusModal,
        statusTarget,
        submitting,
        deleteSubmitting,
        statusSubmitting,
        handleOpenModal,
        handleCloseModal,
        handleDeleteClick,
        handleStatusClick,
        setShowDeleteModal,
        setDeleteTarget,
        setShowStatusModal,
        setStatusTarget,
        setSubmitting,
        setDeleteSubmitting,
        setStatusSubmitting,
    } = useTablesUI()

    const handleSubmit = async (formData: CreateTablePayload) => {
        setSubmitting(true)
        try {
            if (editingTable) {
                await handleUpdate(editingTable.id, formData)
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
            await handleDelete(deleteTarget.id, deleteTarget.number)
            setShowDeleteModal(false)
            setDeleteTarget(null)
        } finally {
            setDeleteSubmitting(false)
        }
    }

    const handleConfirmStatus = async (newStatus: TableStatus) => {
        if (!statusTarget) return
        setStatusSubmitting(true)
        try {
            await handleChangeStatus(
                statusTarget.id,
                statusTarget.number,
                newStatus,
            )
            setShowStatusModal(false)
            setStatusTarget(null)
        } finally {
            setStatusSubmitting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                        Gestión de mesas
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Administra las mesas del restaurante
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus />
                    Nueva mesa
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField label="Filtrar por área">
                    <Select
                        value={filters.areaId}
                        onChange={(e) => {
                            setFilters({ ...filters, areaId: e.target.value })
                            setPage(1)
                        }}
                    >
                        <option value="">Todas las áreas</option>
                        {areas.map((area) => (
                            <option key={area.id} value={area.id}>
                                {area.name}
                            </option>
                        ))}
                    </Select>
                </FormField>

                <FormField label="Filtrar por estado">
                    <Select
                        value={filters.status}
                        onChange={(e) => {
                            setFilters({
                                ...filters,
                                status: e.target.value as TableStatus | '',
                            })
                            setPage(1)
                        }}
                    >
                        <option value="">Todos los estados</option>
                        <option value="AVAILABLE">Disponible</option>
                        <option value="OCCUPIED">Ocupada</option>
                        <option value="RESERVED">Reservada</option>
                    </Select>
                </FormField>
            </div>

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
            ) : tables && tables.data.length > 0 ? (
                <div className="space-y-4">
                    <TableTable
                        tables={tables}
                        onEdit={handleOpenModal}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusClick}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {tables.data.length} de {tables.total} mesas
                        </p>
                        <Pagination
                            page={page}
                            totalPages={tables.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    title="No hay mesas"
                    description="Crea la primera mesa del restaurante para empezar."
                    action={
                        <Button onClick={() => handleOpenModal()}>
                            <Plus />
                            Nueva mesa
                        </Button>
                    }
                />
            )}

            <TableFormModal
                key={editingTable?.id ?? 'new'}
                open={showModal}
                table={editingTable}
                areas={areas}
                onSubmit={handleSubmit}
                onCancel={handleCloseModal}
                submitting={submitting}
            />

            {statusTarget && (
                <TableStatusModal
                    open={showStatusModal}
                    table={statusTarget}
                    onConfirm={handleConfirmStatus}
                    onCancel={() => {
                        setShowStatusModal(false)
                        setStatusTarget(null)
                    }}
                    loading={statusSubmitting}
                />
            )}

            {deleteTarget && (
                <TableDeleteModal
                    open={showDeleteModal}
                    table={deleteTarget}
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
