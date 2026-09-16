'use client'
import React from 'react'
import { UserResponse, CreateUserPayload } from '@/lib/api/admin/users'
import { useUsuarios } from './hooks/useUsuarios'
import { useUsuariosUI } from './hooks/useUsuariosUI'
import UsersTable from './components/UsersTable'
import UserFormModal from './components/UserFormModal'
import DeleteConfirmModal from './components/DeleteConfirmModal'
import ResetPasswordModal from './components/ResetPasswordModal'

export default function UsuariosPage() {
    const {
        users,
        loading,
        error,
        page,
        search,
        existingEmails,
        setPage,
        setSearch,
        createNewUser,
        updateExistingUser,
        deleteExistingUser,
        resetPassword,
    } = useUsuarios()

    const {
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
        setShowModal,
        setEditingUser,
        setShowDeleteModal,
        setDeleteTarget,
        setShowResetModal,
        setResetTarget,
        setSubmitting,
        setDeleteSubmitting,
        setResetSubmitting,
    } = useUsuariosUI()

    const handleSubmitForm = async (payload: CreateUserPayload | Omit<CreateUserPayload, 'password'>) => {
        setSubmitting(true)
        try {
            if (editingUser) {
                await updateExistingUser(editingUser.id, payload as Omit<CreateUserPayload, 'password'>)
            } else {
                await createNewUser(payload as CreateUserPayload)
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
            await deleteExistingUser(deleteTarget.id, deleteTarget.name)
            setShowDeleteModal(false)
            setDeleteTarget(null)
        } finally {
            setDeleteSubmitting(false)
        }
    }

    const handleSubmitResetPassword = async (newPassword: string) => {
        if (!resetTarget) return
        setResetSubmitting(true)
        try {
            await resetPassword(resetTarget.id, newPassword, resetTarget.name)
            setShowResetModal(false)
            setResetTarget(null)
        } finally {
            setResetSubmitting(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Gestión de Usuarios</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">Manage team members and permissions</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center gap-2"
                >
                    ➕ Nuevo Usuario
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Buscar por email o nombre..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value)
                        setPage(1)
                    }}
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                />
            </div>

            {/* Loading / Error */}
            {loading && <div className="text-center py-12 text-slate-600">Cargando usuarios...</div>}
            {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">{error}</div>}

            {/* Users Table */}
            {!loading && users && (
                <UsersTable
                    users={users}
                    loading={loading}
                    error={error}
                    page={page}
                    onPageChange={setPage}
                    onEdit={handleOpenModal}
                    onDelete={handleDeleteClick}
                    onResetPassword={handleResetClick}
                />
            )}

            {/* Modals */}
            <UserFormModal
                isOpen={showModal}
                user={editingUser || null}
                existingEmails={existingEmails}
                onSubmit={handleSubmitForm}
                onClose={() => {
                    setShowModal(false)
                    setEditingUser(undefined)
                }}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                userName={deleteTarget?.name || ''}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                }}
            />

            <ResetPasswordModal
                isOpen={showResetModal}
                userName={resetTarget?.name || ''}
                onSubmit={handleSubmitResetPassword}
                onCancel={() => {
                    setShowResetModal(false)
                    setResetTarget(null)
                }}
            />
        </div>
    )
}
