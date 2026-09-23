'use client'
import React from 'react'
import { TableResponse, CreateTablePayload, TableStatus } from '@/features/tables/api'
import { useTables } from '@/features/tables/hooks/useTables'
import { useTablesUI } from '@/features/tables/hooks/useTablesUI'
import { TableTable } from '@/features/tables/components/TableTable'
import { FormModal } from '@/features/tables/components/FormModal'
import { DeleteModal } from '@/features/tables/components/DeleteModal'
import { StatusModal } from '@/features/tables/components/StatusModal'

export default function MesasPage() {
  const { tables, areas, loading, error, page, filters, setPage, setFilters, handleCreate, handleUpdate, handleDelete, handleChangeStatus } = useTables()
  
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
    setShowModal,
    setEditingTable,
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

  const handleConfirmDelete = async (id: string) => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    try {
      await handleDelete(id, deleteTarget.number)
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
      await handleChangeStatus(statusTarget.id, statusTarget.number, newStatus)
      setShowStatusModal(false)
      setStatusTarget(null)
    } finally {
      setStatusSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Tables</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Administra las tables del restaurante</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          ➕ Nueva Table
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filtrar por Área</label>
          <select
            value={filters.areaId}
            onChange={(e) => {
              setFilters({ ...filters, areaId: e.target.value })
              setPage(1)
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todas las áreas</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Filtrar por Estado</label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value as TableStatus | '' })
              setPage(1)
            }}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">Todos los estados</option>
            <option value="AVAILABLE">Disponible</option>
            <option value="OCCUPIED">Ocupada</option>
            <option value="RESERVED">Reservada</option>
          </select>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-12 text-slate-600">Cargando tables...</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">{error}</div>}

      {/* Tables */}
      {!loading && tables && (
        <div>
          <TableTable
            tables={tables}
            onEdit={(table: TableResponse) => handleOpenModal(table)}
            onDelete={(table: TableResponse) => handleDeleteClick(table)}
            onStatusChange={(table: TableResponse) => handleStatusClick(table)}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {tables.data.length} de {tables.total} tables
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                ← Anterior
              </button>
              <div className="flex items-center gap-2">
                {Array.from({ length: tables.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-3 py-2 rounded-lg font-medium transition-all ${
                      p === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPage(Math.min(tables.totalPages, page + 1))}
                disabled={page === tables.totalPages}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Mesa */}
      {showModal && (
        <FormModal
          table={editingTable}
          areas={areas}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          submitting={submitting}
        />
      )}

      {/* Modal Cambiar Estado */}
      {showStatusModal && statusTarget && (
        <StatusModal
          table={statusTarget}
          onConfirm={handleConfirmStatus}
          onCancel={() => {
            setShowStatusModal(false)
            setStatusTarget(null)
          }}
          loading={statusSubmitting}
        />
      )}

      {/* Modal Confirmar Desactivación */}
      {showDeleteModal && deleteTarget && (
        <DeleteModal
          table={deleteTarget}
          onConfirm={() => handleConfirmDelete(deleteTarget.id)}
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
