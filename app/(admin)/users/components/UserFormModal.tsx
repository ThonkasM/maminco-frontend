'use client'
import React, { useState, useEffect } from 'react'
import { UserResponse, CreateUserPayload } from '@/lib/api/admin/users'

interface UserFormModalProps {
    isOpen: boolean
    user: UserResponse | null
    existingEmails: Set<string>
    onSubmit: (payload: CreateUserPayload | Omit<CreateUserPayload, 'password'>) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

interface FormData {
    name: string
    email: string
    password: string
    role: string
}

interface FormErrors {
    name?: string
    email?: string
    password?: string
}

const ROLES = [
    { value: 'WAITER', label: 'Mesero' },
    { value: 'CASHIER', label: 'Cajero' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'ADMINISTRATOR', label: 'Administrador' },
]

export default function UserFormModal({
    isOpen,
    user,
    existingEmails,
    onSubmit,
    onClose,
    isLoading,
}: UserFormModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'WAITER',
    })
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (user) {
                setFormData({
                    name: user.name,
                    email: user.email,
                    password: '',
                    role: user.role,
                })
            } else {
                setFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'WAITER',
                })
            }
            setFormErrors({})
        }
    }, [isOpen, user])

    const validateForm = (): boolean => {
        const errors: FormErrors = {}

        if (!formData.name.trim()) errors.name = 'El nombre es requerido'
        if (!formData.email.trim()) errors.email = 'El email es requerido'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Email inválido'
        else if (!user || formData.email !== user.email) {
            if (existingEmails.has(formData.email)) errors.email = 'Email ya existe en el sistema'
        }

        if (!user && !formData.password) {
            errors.password = 'La contraseña es requerida'
        } else if (!user && formData.password.length < 8) {
            errors.password = 'Mínimo 8 caracteres'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            if (user) {
                await onSubmit({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role as any,
                })
            } else {
                await onSubmit({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role as any,
                } as CreateUserPayload)
            }
            handleClose()
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'WAITER',
        })
        setFormErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {user ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value })
                                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                            placeholder="Juan Pérez"
                        />
                        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Email *
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value })
                                if (formErrors.email) setFormErrors({ ...formErrors, email: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.email ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                            placeholder="juan@ejemplo.com"
                        />
                        {formErrors.email && <p className="text-red-600 text-sm mt-1">{formErrors.email}</p>}
                    </div>

                    {/* Password (only for new users) */}
                    {!user && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Contraseña *
                            </label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => {
                                    setFormData({ ...formData, password: e.target.value })
                                    if (formErrors.password) setFormErrors({ ...formErrors, password: undefined })
                                }}
                                className={`w-full px-4 py-2 rounded-lg border ${
                                    formErrors.password ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                                placeholder="Mínimo 8 caracteres"
                            />
                            {formErrors.password && <p className="text-red-600 text-sm mt-1">{formErrors.password}</p>}
                        </div>
                    )}

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Rol
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
                        >
                            {ROLES.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-all"
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
