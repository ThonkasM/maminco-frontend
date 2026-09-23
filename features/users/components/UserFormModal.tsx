'use client'
import { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
    Select,
} from '@/components/ui'
import type { CreateUserPayload, UserResponse } from '../api'

const ROLES = [
    { value: 'WAITER', label: 'Mesero' },
    { value: 'CASHIER', label: 'Cajero' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'ADMINISTRATOR', label: 'Administrador' },
] as const

interface UserFormModalProps {
    isOpen: boolean
    user: UserResponse | null
    existingEmails: Set<string>
    onSubmit: (
        payload: CreateUserPayload | Omit<CreateUserPayload, 'password'>,
    ) => Promise<void>
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

export function UserFormModal({
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
        if (!isOpen) return
        setFormData({
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            role: user?.role ?? 'WAITER',
        })
        setFormErrors({})
    }, [isOpen, user])

    const validateForm = (): boolean => {
        const errors: FormErrors = {}

        if (!formData.name.trim()) errors.name = 'El nombre es requerido'
        if (!formData.email.trim()) errors.email = 'El email es requerido'
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
            errors.email = 'Email inválido'
        else if (
            (!user ||
                formData.email.toLowerCase() !== user.email.toLowerCase()) &&
            existingEmails.has(formData.email.toLowerCase())
        ) {
            errors.email = 'El email ya existe en el sistema'
        }

        if (!user && !formData.password) {
            errors.password = 'La contraseña es requerida'
        } else if (!user && formData.password.length < 8) {
            errors.password = 'Mínimo 8 caracteres'
        }

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            if (user) {
                await onSubmit({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    role: formData.role as CreateUserPayload['role'],
                })
            } else {
                await onSubmit({
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    password: formData.password,
                    role: formData.role as CreateUserPayload['role'],
                })
            }
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const handleOpenChange = (next: boolean) => {
        if (!next) onClose()
    }

    const loading = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {user ? 'Editar usuario' : 'Nuevo usuario'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField
                        label="Nombre"
                        required
                        error={formErrors.name}
                    >
                        <Input
                            value={formData.name}
                            placeholder="Juan Pérez"
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    name: e.target.value,
                                })
                                if (formErrors.name)
                                    setFormErrors({
                                        ...formErrors,
                                        name: undefined,
                                    })
                            }}
                        />
                    </FormField>

                    <FormField label="Email" required error={formErrors.email}>
                        <Input
                            type="email"
                            value={formData.email}
                            placeholder="juan@ejemplo.com"
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    email: e.target.value,
                                })
                                if (formErrors.email)
                                    setFormErrors({
                                        ...formErrors,
                                        email: undefined,
                                    })
                            }}
                        />
                    </FormField>

                    {!user && (
                        <FormField
                            label="Contraseña"
                            required
                            error={formErrors.password}
                        >
                            <Input
                                type="password"
                                value={formData.password}
                                placeholder="Mínimo 8 caracteres"
                                onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        password: e.target.value,
                                    })
                                    if (formErrors.password)
                                        setFormErrors({
                                            ...formErrors,
                                            password: undefined,
                                        })
                                }}
                            />
                        </FormField>
                    )}

                    <FormField label="Rol">
                        <Select
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    role: e.target.value,
                                })
                            }
                        >
                            {ROLES.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            className="flex-1"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={loading}
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
