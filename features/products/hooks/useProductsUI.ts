import { useState } from 'react'
import { ProductResponse } from '@/features/products/api'

interface UseProductsUIReturn {
    showModal: boolean
    editingProduct: ProductResponse | undefined
    showDeleteModal: boolean
    deleteTarget: ProductResponse | null

    // Estados de carga
    submitting: boolean
    deleteSubmitting: boolean

    // Handlers UI
    handleOpenModal: (product?: ProductResponse) => void
    handleCloseModal: () => void
    handleDeleteClick: (product: ProductResponse) => void

    setSubmitting: (value: boolean) => void
    setDeleteSubmitting: (value: boolean) => void
    setShowDeleteModal: (value: boolean) => void
    setDeleteTarget: (value: ProductResponse | null) => void
    setShowModal: (value: boolean) => void
    setEditingProduct: (value: ProductResponse | undefined) => void
}

/**
 * Hook que gestiona TODO el estado UI de la página de productos
 * Responsabilidades:
 * - Modal de crear/editar
 * - Modal de confirmación de delete
 * - Estados de carga durante operaciones
 */
export function useProductsUI(): UseProductsUIReturn {
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState<ProductResponse | undefined>(undefined)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<ProductResponse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)

    const handleOpenModal = (product?: ProductResponse) => {
        if (product) {
            setEditingProduct(product)
        } else {
            setEditingProduct(undefined)
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingProduct(undefined)
    }

    const handleDeleteClick = (product: ProductResponse) => {
        setDeleteTarget(product)
        setShowDeleteModal(true)
    }

    return {
        showModal,
        editingProduct,
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
        setShowModal,
        setEditingProduct,
    }
}
