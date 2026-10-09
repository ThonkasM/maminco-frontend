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
    Textarea,
} from '@/components/ui'
import type { ProductResponse, CreateProductPayload } from '@/features/products/api'
import type { CategoryResponse } from '@/features/categories/api'

function makeSchema(existingNames: Set<string>, product: ProductResponse | null) {
    return z.object({
        name: z
            .string()
            .trim()
            .min(1, 'El nombre del producto es requerido')
            .min(2, 'Mínimo 2 caracteres')
            .refine((value) => {
                const normalized = value.toLowerCase()
                return !(
                    existingNames.has(normalized) &&
                    (!product || product.name.toLowerCase() !== normalized)
                )
            }, 'Ya existe un producto con este nombre'),
        description: z.string(),
        price: z
            .string()
            .min(1, 'El precio es requerido')
            .refine((value) => !Number.isNaN(Number(value)), 'Debe ser un número válido')
            .refine((value) => Number(value) > 0, 'El precio debe ser mayor a 0')
            .refine(
                (value) => /^\d+(\.\d{1,2})?$/.test(value.trim()),
                'Máximo 2 decimales',
            ),
        categoryId: z.string().min(1, 'La categoría es requerida'),
    })
}

type FormValues = z.infer<ReturnType<typeof makeSchema>>

interface ProductFormModalProps {
    isOpen: boolean
    product: ProductResponse | null
    categories: CategoryResponse[]
    existingNames: Set<string>
    onSubmit: (payload: CreateProductPayload) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export function ProductFormModal({
    isOpen,
    product,
    categories,
    existingNames,
    onSubmit,
    onClose,
    isLoading,
}: ProductFormModalProps) {
    const schema = useMemo(
        () => makeSchema(existingNames, product),
        [existingNames, product],
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
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product ? String(product.price) : '',
            categoryId: product?.categoryId ?? '',
        },
    })

    useEffect(() => {
        if (!isOpen) return
        reset({
            name: product?.name ?? '',
            description: product?.description ?? '',
            price: product ? String(product.price) : '',
            categoryId: product?.categoryId ?? '',
        })
    }, [isOpen, product, reset])

    const submit = handleSubmit(async (values) => {
        setSubmitting(true)
        try {
            await onSubmit({
                name: values.name.trim(),
                description: values.description.trim() || undefined,
                price: Number(values.price),
                categoryId: values.categoryId,
            })
            onClose()
        } finally {
            setSubmitting(false)
        }
    })

    const disabled = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'Editar producto' : 'Nuevo producto'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4">
                    <FormField label="Nombre" required error={errors.name?.message}>
                        <Input
                            autoFocus
                            placeholder="Ej: Café, Pizza..."
                            {...register('name')}
                        />
                    </FormField>

                    <FormField label="Descripción" description="Opcional">
                        <Textarea
                            placeholder="Descripción opcional..."
                            rows={2}
                            {...register('description')}
                        />
                    </FormField>

                    <FormField
                        label="Precio (Bs.)"
                        description="Hasta 2 decimales, ej. 250,50"
                        required
                        error={errors.price?.message}
                    >
                        <Input
                            type="number"
                            step="0.01"
                            min="0"
                            inputMode="decimal"
                            placeholder="Ej: 250.50"
                            {...register('price')}
                        />
                    </FormField>

                    <Controller
                        control={control}
                        name="categoryId"
                        render={({ field, fieldState }) => (
                            <FormField
                                label="Categoría"
                                required
                                error={fieldState.error?.message}
                            >
                                <Select
                                    value={field.value}
                                    onChange={(event) =>
                                        field.onChange(event.target.value)
                                    }
                                    placeholder="Selecciona una categoría..."
                                >
                                    <option value="">Selecciona una categoría...</option>
                                    {categories.map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
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
                            disabled={disabled}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" className="flex-1" disabled={disabled}>
                            {disabled ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
