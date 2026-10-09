'use client'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, FormField, Input, Textarea } from '@/components/ui'
import type { AreaResponse, CreateAreaPayload } from '../api'

function makeSchema(existingNames: Set<string>, currentName?: string) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, 'El nombre del área es requerido')
            .min(2, 'Mínimo 2 caracteres')
            .refine(
                (value) => !(existingNames.has(value) && value !== currentName),
                'Ya existe un área con este nombre',
            ),
        description: z.string(),
        isVirtual: z.boolean(),
    })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

interface AreaFormProps {
    area?: AreaResponse
    existingNames: Set<string>
    onSubmit: (formData: CreateAreaPayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function AreaForm({
    area,
    existingNames,
    onSubmit,
    onCancel,
    submitting = false,
}: AreaFormProps) {
    const schema = useMemo(
        () => makeSchema(existingNames, area?.name),
        [existingNames, area?.name],
    )

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: area?.name ?? '',
            description: area?.description ?? '',
            isVirtual: area?.isVirtual ?? false,
        },
    })

    const submit = handleSubmit(async (values) => {
        await onSubmit(values)
    })

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormField label="Nombre del área" required error={errors.name?.message}>
                <Input
                    autoFocus
                    placeholder="Ej: Salón, Exterior, VIP"
                    {...register('name')}
                />
            </FormField>

            <FormField label="Descripción" description="Opcional">
                <Textarea
                    placeholder="Descripción del área..."
                    rows={3}
                    {...register('description')}
                />
            </FormField>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-muted/50 p-3">
                <input
                    type="checkbox"
                    className="mt-0.5 size-4 rounded border-border accent-primary"
                    {...register('isVirtual')}
                />
                <span className="text-sm">
                    <span className="font-medium text-foreground">Área virtual</span>
                    <span className="block text-xs text-muted-foreground">
                        Para servicios como Delivery o Recoger, sin mesas físicas.
                    </span>
                </span>
            </label>

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
