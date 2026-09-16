import { useState } from 'react'
import { TableResponse } from '@/lib/api/admin/tables'

/**
 * Hook que gestiona TODO el estado UI de la página de mesas
 * Responsabilidades:
 * - Modal de crear/editar
 * - Modal de confirmación de delete
 * - Modal de cambio de estado
 * - Estados de carga durante operaciones
 */

export function useMesasUI() {
    const [showModal, setShowModal] = useState(false)
    const [editingTable, setEditingTable] = useState<TableResponse | undefined>(undefined)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState<TableResponse | null>(null)
    const [showStatusModal, setShowStatusModal] = useState(false)
    const [statusTarget, setStatusTarget] = useState<TableResponse | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteSubmitting, setDeleteSubmitting] = useState(false)
    const [statusSubmitting, setStatusSubmitting] = useState(false)

    const handleOpenModal = (table?: TableResponse) => {
        if (table) {
            setEditingTable(table)
        } else {
            setEditingTable(undefined)
        }
        setShowModal(true)
    }

    const handleCloseModal = () => {
        setShowModal(false)
        setEditingTable(undefined)
    }

    const handleDeleteClick = (table: TableResponse) => {
        setDeleteTarget(table)
        setShowDeleteModal(true)
    }

    const handleStatusClick = (table: TableResponse) => {
        setStatusTarget(table)
        setShowStatusModal(true)
    }

    return {
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
    }
}
