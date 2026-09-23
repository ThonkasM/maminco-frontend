'use client'
import { Plus, Users as UsersIcon } from 'lucide-react'
import { Button, EmptyState, Input, Pagination, Skeleton } from '@/components/ui'
import type { CreateUserPayload } from '../api'
import { useUsers } from '../hooks/useUsers'
import { useUsersUI } from '../hooks/useUsersUI'
import { UsersTable } from './UsersTable'
import { UserFormModal } from './UserFormModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { ResetPasswordModal } from './ResetPasswordModal'

export function UsersPage() {
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
    } = useUsers()

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
    } = useUsersUI()

    const handleSubmitForm = async (
        payload: CreateUserPayload | Omit<CreateUserPayload, 'password'>,
    ) => {
        setSubmitting(true)
        try {
            if (editingUser) {
                await updateExistingUser(
                    editingUser.id,
                    payload as Omit<CreateUserPayload, 'password'>,
                )
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
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Gestión de usuarios
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Administra los usuarios y sus permisos
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus />
                    Nuevo usuario
                </Button>
            </div>

            <Input
                placeholder="Buscar por email o nombre..."
                value={search}
                onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                }}
            />

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
            ) : users && users.data.length > 0 ? (
                <div className="space-y-4">
                    <UsersTable
                        users={users}
                        onEdit={handleOpenModal}
                        onDelete={handleDeleteClick}
                        onResetPassword={handleResetClick}
                    />
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {users.data.length} de {users.total} usuarios
                        </p>
                        <Pagination
                            page={page}
                            totalPages={users.totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                </div>
            ) : (
                <EmptyState
                    icon={<UsersIcon />}
                    title="No hay usuarios"
                    description="Crea el primer usuario del sistema para empezar."
                    action={
                        <Button onClick={() => handleOpenModal()}>
                            <Plus />
                            Nuevo usuario
                        </Button>
                    }
                />
            )}

            <UserFormModal
                key={editingUser?.id ?? 'new'}
                isOpen={showModal}
                user={editingUser ?? null}
                existingEmails={existingEmails}
                onSubmit={handleSubmitForm}
                onClose={() => {
                    setShowModal(false)
                    setEditingUser(undefined)
                }}
                isLoading={submitting}
            />

            <DeleteConfirmModal
                isOpen={showDeleteModal}
                userName={deleteTarget?.name || ''}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setShowDeleteModal(false)
                    setDeleteTarget(null)
                }}
                isLoading={deleteSubmitting}
            />

            <ResetPasswordModal
                isOpen={showResetModal}
                userName={resetTarget?.name || ''}
                onSubmit={handleSubmitResetPassword}
                onCancel={() => {
                    setShowResetModal(false)
                    setResetTarget(null)
                }}
                isLoading={resetSubmitting}
            />
        </div>
    )
}
