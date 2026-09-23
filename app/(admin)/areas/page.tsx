'use client'
import React from 'react'
import { AreaResponse, CreateAreaPayload } from '@/features/areas/api'
import { useAreas } from '@/features/areas/hooks/useAreas'
import { useAreasUI } from '@/features/areas/hooks/useAreasUI'
import { AreaTable } from '@/features/areas/components/AreaTable'
import { FormModal } from '@/features/areas/components/FormModal'
import { DeleteModal } from '@/features/areas/components/DeleteModal'

export default function AreasPage() {
  const { areas, loading, error, page, search, existingNames, setPage, setSearch, handleCreate, handleUpdate, handleDelete } = useAreas()
  
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

  const handleSubmit = async (formData: CreateAreaPayload) => {
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

  const handleConfirmDelete = async (id: string) => {
    if (!deleteTarget) return
    setDeleteSubmitting(true)
    try {
      await handleDelete(id, deleteTarget.name)
      setShowDeleteModal(false)
      setDeleteTarget(null)
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Áreas</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Administra las áreas del restaurante</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          ➕ Nueva Área
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-12 text-slate-600">Cargando áreas...</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">{error}</div>}

      {/* Areas Table */}
      {!loading && areas && (
        <div>
          <AreaTable
            areas={areas}
            onEdit={(area: AreaResponse) => handleOpenModal(area)}
            onDelete={(area: AreaResponse) => handleDeleteClick(area)}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {areas.data.length} de {areas.total} áreas
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
                {Array.from({ length: areas.totalPages }, (_, i) => i + 1).map((p) => (
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
                onClick={() => setPage(Math.min(areas.totalPages, page + 1))}
                disabled={page === areas.totalPages}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Área */}
      {showModal && (
        <FormModal
          area={editingArea}
          existingNames={existingNames}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          submitting={submitting}
        />
      )}

      {/* Modal Confirmar Desactivación */}
      {showDeleteModal && deleteTarget && (
        <DeleteModal
          area={deleteTarget}
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
