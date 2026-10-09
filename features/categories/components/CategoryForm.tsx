'use client'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, FormField, Input, Textarea } from '@/components/ui'
import type { CategoryResponse, CreateCategoryPayload } from '../api'

function makeSchema(existingNames: Set<string>, currentName?: string) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, 'El nombre de la categoría es requerido')
            .min(2, 'Mínimo 2 caracteres')
            .refine(
                (value) =>
                    !(
                        existingNames.has(value.toLowerCase()) &&
                        value.toLowerCase() !== currentName?.toLowerCase()
                    ),
                'Ya existe una categoría con este nombre',
            ),
        description: z.string(),
    })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

interface CategoryFormProps {
    category?: CategoryResponse
    existingNames: Set<string>
    onSubmit: (formData: CreateCategoryPayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function CategoryForm({
    category,
    existingNames,
    onSubmit,
    onCancel,
    submitting = false,
}: CategoryFormProps) {
    const schema = useMemo(
        () => makeSchema(existingNames, category?.name),
        [existingNames, category?.name],
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: category?.name ?? '',
            description: category?.description ?? '',
        },
    })

    const submit = handleSubmit(async (values) => {
        await onSubmit({
            name: values.name,
            description: values.description.trim() || undefined,
        })
    })

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormField
                label="Nombre de la categoría"
                required
                error={errors.name?.message}
            >
                <Input
                    autoFocus
                    placeholder="Ej: Bebidas, Postres, Platos principales"
                    {...register('name')}
                />
            </FormField>

            <FormField label="Descripción" description="Opcional">
                <Textarea
                    placeholder="Descripción de la categoría..."
                    rows={3}
                    {...register('description')}
                />
            </FormField>

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="secondary"
                    className="flex-1"
                    onClick={onCancel}
                >
                    Cancelar
                </Button>
                <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? 'Guardando...' : 'Guardar'}
                </Button>
            </div>
        </form>
    )
}
