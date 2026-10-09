'use client'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
    { value: 'COOK', label: 'Cocinero' },
    { value: 'CASHIER', label: 'Cajero' },
    { value: 'MANAGER', label: 'Gerente' },
    { value: 'ADMINISTRATOR', label: 'Administrador' },
] as const

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function makeSchema(existingEmails: Set<string>, user: UserResponse | null) {
    const base = z.object({
        name: z.string().trim().min(1, 'El nombre es requerido'),
        email: z
            .string()
            .trim()
            .min(1, 'El email es requerido')
            .refine((value) => EMAIL_REGEX.test(value), 'Email inválido')
            .refine(
                (value) =>
                    !(
                        existingEmails.has(value.toLowerCase()) &&
                        (!user || user.email.toLowerCase() !== value.toLowerCase())
                    ),
                'El email ya existe en el sistema',
            ),
        password: z.string(),
        role: z.enum(['WAITER', 'COOK', 'CASHIER', 'MANAGER', 'ADMINISTRATOR']),
    })

    return base.superRefine((data, ctx) => {
        if (user) return
        if (!data.password) {
            ctx.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'La contraseña es requerida',
            })
        } else if (data.password.length < 8) {
            ctx.addIssue({
                code: 'custom',
                path: ['password'],
                message: 'Mínimo 8 caracteres',
            })
        }
    })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

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

export function UserFormModal({
    isOpen,
    user,
    existingEmails,
    onSubmit,
    onClose,
    isLoading,
}: UserFormModalProps) {
    const schema = useMemo(
        () => makeSchema(existingEmails, user),
        [existingEmails, user],
    )
    const [submitting, setSubmitting] = useState(false)

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            role: (user?.role as FormValues['role']) ?? 'WAITER',
        },
    })

    useEffect(() => {
        if (!isOpen) return
        reset({
            name: user?.name ?? '',
            email: user?.email ?? '',
            password: '',
            role: (user?.role as FormValues['role']) ?? 'WAITER',
        })
    }, [isOpen, user, reset])

    const submit = handleSubmit(async (values) => {
        setSubmitting(true)
        try {
            if (user) {
                await onSubmit({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    role: values.role,
                })
            } else {
                await onSubmit({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    password: values.password,
                    role: values.role,
                })
            }
            onClose()
        } finally {
            setSubmitting(false)
        }
    })

    const loading = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {user ? 'Editar usuario' : 'Nuevo usuario'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <FormField label="Nombre" required error={errors.name?.message}>
                        <Input
                            autoFocus
                            placeholder="Juan Pérez"
                            {...register('name')}
                        />
                    </FormField>

                    <FormField label="Email" required error={errors.email?.message}>
                        <Input
                            type="email"
                            placeholder="juan@ejemplo.com"
                            {...register('email')}
                        />
                    </FormField>

                    {!user && (
                        <FormField
                            label="Contraseña"
                            required
                            error={errors.password?.message}
                        >
                            <Input
                                type="password"
                                placeholder="Mínimo 8 caracteres"
                                {...register('password')}
                            />
                        </FormField>
                    )}

                    <Controller
                        control={control}
                        name="role"
                        render={({ field }) => (
                            <FormField label="Rol">
                                <Select
                                    value={field.value}
                                    onChange={(event) =>
                                        field.onChange(event.target.value)
                                    }
                                >
                                    {ROLES.map((role) => (
                                        <option key={role.value} value={role.value}>
                                            {role.label}
                                        </option>
                                    ))}
                                </Select>
                            </FormField>
                        )}
                    />

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
                        <Button type="submit" className="flex-1" disabled={loading}>
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
