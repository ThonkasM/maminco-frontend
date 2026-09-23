'use client'
import React from 'react'
import { CategoryResponse, CreateCategoryPayload } from '@/lib/api/admin/categories'
import { useCategories } from './hooks/useCategories'
import { useCategoriesUI } from './hooks/useCategoriesUI'
import { CategoryTable } from './components/CategoryTable'
import { FormModal } from './components/FormModal'
import { DeleteModal } from './components/DeleteModal'
import AdminGuard from '../components/AdminGuard'

function CategoriasPageContent() {
  const { categories, loading, error, page, search, existingNames, setPage, setSearch, loadCategoryNames, handleCreate, handleUpdate, handleDelete } = useCategories()
  
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

  // Wrapper para agregar lógica específica de categorías
  const handleOpenModal = async (category?: CategoryResponse) => {
    handleUIOpenModal(category)
    await loadCategoryNames(category?.id)
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
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Categorías</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">Administra las categorías de products</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
        >
          ➕ Nueva Categoría
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
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Loading / Error */}
      {loading && <div className="text-center py-12 text-slate-600">Cargando categorías...</div>}
      {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">{error}</div>}

      {/* Table */}
      {!loading && categories && (
        <div>
          <CategoryTable
            categories={categories}
            onEdit={(category: CategoryResponse) => handleOpenModal(category)}
            onDelete={(category: CategoryResponse) => handleDeleteClick(category)}
          />

          {/* Pagination */}
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Mostrando {categories.data.length} de {categories.total} categorías
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
                {Array.from({ length: categories.totalPages }, (_, i) => i + 1).map((p) => (
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
                onClick={() => setPage(Math.min(categories.totalPages, page + 1))}
                disabled={page === categories.totalPages}
                className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Siguiente →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Crear/Editar Categoría */}
      {showModal && (
        <FormModal
          category={editingCategory}
          existingNames={existingNames}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          submitting={submitting}
        />
      )}

      {/* Modal Confirmar Desactivación */}
      {showDeleteModal && deleteTarget && (
        <DeleteModal
          category={deleteTarget}
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

export default function CategoriasPage() {
  return (
    <AdminGuard>
      <CategoriasPageContent />
    </AdminGuard>
  )
}
