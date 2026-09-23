import { useState } from 'react'
import { AreaResponse, CreateAreaPayload } from '@/features/areas/api'

interface UseAreasUIReturn {
    // Estado de modales
    showModal: boolean
    editingArea: AreaResponse | undefined
    showDeleteModal: boolean
    deleteTarget: AreaResponse | null

    // Estados de carga
    submitting: boolean
    deleteSubmitting: boolean

    // Handlers UI
    handleOpenModal: (area?: AreaResponse) => void
    handleCloseModal: () => void
    handleDeleteClick: (area: AreaResponse) => void

    // Setters para handlers de CRUD
    setSubmitting: (value: boolean) => void
    setDeleteSubmitting: (value: boolean) => void
    setShowDeleteModal: (value: boolean) => void
    setDeleteTarget: (value: AreaResponse | null) => void
}

/**
 * Hook que gestiona TODO el estado UI de la página de áreas
 * Responsabilidades:
 * - Modal de crear/editar
 * - Modal de confirmación de delete
 * - Estados de carga durante operaciones
 */
export function useAreasUI(): UseAreasUIReturn {
    const [showModal, setShowModal] = useState(false)
    const [editingArea, setEditingArea] = useState<AreaResponse | undefined>(undefined)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<AreaResponse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)

    const handleOpenModal = (area?: AreaResponse) => {
        if (area) {
            setEditingArea(area)
        } else {
            setEditingArea(undefined)
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingArea(undefined)
    }

    const handleDeleteClick = (area: AreaResponse) => {
        setDeleteTarget(area)
        setShowDeleteModal(true)
    }

    return {
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
    }
}
