'use client'
import { useMemo } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button, FormField, Input, Select } from '@/components/ui'
import type { TableResponse, CreateTablePayload } from '../api'
import type { AreaResponse } from '@/features/areas/api'

function makeSchema() {
    return z.object({
        number: z
            .string()
            .min(1, 'El número de mesa es requerido')
            .refine((value) => !Number.isNaN(Number(value)), 'Debe ser un número')
            .refine((value) => Number(value) >= 0, 'El número no puede ser negativo'),
        areaId: z.string().min(1, 'El área es requerida'),
    })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

interface TableFormProps {
    table?: TableResponse
    areas: AreaResponse[]
    onSubmit: (formData: CreateTablePayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function TableForm({
    table,
    areas,
    onSubmit,
    onCancel,
    submitting = false,
}: TableFormProps) {
    const schema = useMemo(() => makeSchema(), [])

    const {
        register,
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>({
        resolver: zodResolver(schema),
        defaultValues: {
            number: table ? String(table.number) : '',
            areaId: table?.areaId ?? '',
        },
    })

    const submit = handleSubmit(async (values) => {
        await onSubmit({
            number: Number(values.number),
            areaId: values.areaId,
        })
    })

    return (
        <form onSubmit={submit} className="space-y-4">
            <FormField label="Número de mesa" required error={errors.number?.message}>
                <Input
                    autoFocus
                    type="number"
                    placeholder="Ej: 1, 2, 3..."
                    {...register('number')}
                />
            </FormField>

            <Controller
                control={control}
                name="areaId"
                render={({ field, fieldState }) => (
                    <FormField label="Área" required error={fieldState.error?.message}>
                        <Select
                            value={field.value}
                            onChange={(event) => field.onChange(event.target.value)}
                            placeholder="Selecciona un área"
                        >
                            <option value="">Selecciona un área</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
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
