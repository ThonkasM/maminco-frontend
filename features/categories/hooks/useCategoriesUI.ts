import { useState } from 'react'
import { CategoryResponse } from '@/features/categories/api'

interface UseCategoriesUIReturn {
    // Estado de modales
    showModal: boolean
    editingCategory: CategoryResponse | undefined
    showDeleteModal: boolean
    deleteTarget: CategoryResponse | null

    // Estados de carga
    submitting: boolean
    deleteSubmitting: boolean

    // Handlers UI
    handleOpenModal: (category?: CategoryResponse) => void
    handleCloseModal: () => void
    handleDeleteClick: (category: CategoryResponse) => void

    // Setters para handlers de CRUD
    setSubmitting: (value: boolean) => void
    setDeleteSubmitting: (value: boolean) => void
    setShowDeleteModal: (value: boolean) => void
    setDeleteTarget: (value: CategoryResponse | null) => void
}

/**
 * Hook que gestiona TODO el estado UI de la página de categorías
 * Responsabilidades:
 * - Modal de crear/editar
 * - Modal de confirmación de delete
 * - Estados de carga durante operaciones
 */
export function useCategoriesUI(): UseCategoriesUIReturn {
    const [showModal, setShowModal] = useState(false)
    const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>(undefined)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<CategoryResponse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)

    const handleOpenModal = (category?: CategoryResponse) => {
        if (category) {
            setEditingCategory(category)
        } else {
            setEditingCategory(undefined)
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingCategory(undefined)
    }

    const handleDeleteClick = (category: CategoryResponse) => {
        setDeleteTarget(category)
        setShowDeleteModal(true)
    }

    return {
        showModal,
        editingCategory,
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
    }
}
