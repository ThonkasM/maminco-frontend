import { useState } from 'react'
import { UserResponse } from '@/lib/api/admin/users'

interface UseUsuariosUIReturn {
    // Estado de modales
    showModal: boolean
    editingUser: UserResponse | undefined
    showDeleteModal: boolean
    deleteTarget: UserResponse | null
    showResetModal: boolean
    resetTarget: UserResponse | null

    // Estados de carga
    submitting: boolean
    deleteSubmitting: boolean
    resetSubmitting: boolean

    // Handlers UI
    handleOpenModal: (user?: UserResponse) => void
    handleCloseModal: () => void
    handleDeleteClick: (user: UserResponse) => void
    handleResetClick: (user: UserResponse) => void

    // Setters para handlers de CRUD
    setSubmitting: (value: boolean) => void
    setDeleteSubmitting: (value: boolean) => void
    setResetSubmitting: (value: boolean) => void
    setShowDeleteModal: (value: boolean) => void
    setDeleteTarget: (value: UserResponse | null) => void
    setShowResetModal: (value: boolean) => void
    setResetTarget: (value: UserResponse | null) => void
    setShowModal: (value: boolean) => void
    setEditingUser: (value: UserResponse | undefined) => void
}

/**
 * Hook que gestiona TODO el estado UI de la página de usuarios
 * Responsabilidades:
 * - Modal de crear/editar
 * - Modal de confirmación de delete
 * - Modal de reset de contraseña
 * - Estados de carga durante operaciones
 */
export function useUsuariosUI(): UseUsuariosUIReturn {
    const [showModal, setShowModal] = useState(false)
    const [editingUser, setEditingUser] = useState<UserResponse | undefined>(undefined)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null)
    const [showResetModal, setShowResetModal] = useState(false)
    const [resetTarget, setResetTarget] = useState<UserResponse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)
    const [resetSubmitting, setResetSubmitting] = useState(false)

    const handleOpenModal = (user?: UserResponse) => {
        if (user) {
            setEditingUser(user)
        } else {
            setEditingUser(undefined)
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingUser(undefined)
    }

    const handleDeleteClick = (user: UserResponse) => {
        setDeleteTarget(user)
        setShowDeleteModal(true)
    }

    const handleResetClick = (user: UserResponse) => {
        setResetTarget(user)
        setShowResetModal(true)
    }

    return {
        showModal,
        editingUser,
        showDeleteModal,
        deleteTarget,
        showResetModal,
        resetTarget,
        submitting,
        deleteSubmitting,
        resetSubmitting,
        handleOpenModal,
        handleCloseModal,
        handleDeleteClick,
        handleResetClick,
        setSubmitting,
        setDeleteSubmitting,
        setResetSubmitting,
        setShowDeleteModal,
        setDeleteTarget,
        setShowResetModal,
        setResetTarget,
        setShowModal,
        setEditingUser,
    }
}
