'use client'
import { useState, useEffect } from 'react'
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

interface ProductFormModalProps {
    isOpen: boolean
    product: ProductResponse | null
    categories: CategoryResponse[]
    existingNames: Set<string>
    onSubmit: (payload: CreateProductPayload) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

interface FormData {
    name: string
    description: string
    price: string
    categoryId: string
}

interface FormErrors {
    name?: string
    price?: string
    categoryId?: string
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
    const [formData, setFormData] = useState<FormData>(() => ({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product ? String(product.price) : '',
        categoryId: product?.categoryId ?? '',
    }))
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: String(product.price),
                    categoryId: product.categoryId,
                })
            } else {
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    categoryId: '',
                })
            }
            setFormErrors({})
        }
    }, [isOpen, product])

    const validate = (): boolean => {
        const errors: FormErrors = {}

        if (!formData.name.trim()) errors.name = 'El nombre del producto es requerido'
        else if (formData.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres'
        else if (
            existingNames.has(formData.name.trim().toLowerCase()) &&
            (!product ||
                product.name.toLowerCase() !== formData.name.trim().toLowerCase())
        )
            errors.name = 'Ya existe un producto con este nombre'

        if (!formData.price) errors.price = 'El precio es requerido'
        else if (isNaN(Number(formData.price))) errors.price = 'Debe ser un número válido'
        else if (Number(formData.price) <= 0) errors.price = 'El precio debe ser mayor a 0'
        else if (!Number.isInteger(Number(formData.price)))
            errors.price = 'El precio debe ser un número entero (sin decimales)'

        if (!formData.categoryId) errors.categoryId = 'La categoría es requerida'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!validate()) return

        setSubmitting(true)
        try {
            await onSubmit({
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: Number(formData.price),
                categoryId: formData.categoryId,
            })
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    const disabled = submitting || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {product ? 'Editar producto' : 'Nuevo producto'}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Nombre" required error={formErrors.name}>
                        <Input
                            autoFocus
                            value={formData.name}
                            placeholder="Ej: Café, Pizza..."
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value })
                                if (formErrors.name)
                                    setFormErrors({ ...formErrors, name: undefined })
                            }}
                        />
                    </FormField>

                    <FormField label="Descripción" description="Opcional">
                        <Textarea
                            value={formData.description}
                            placeholder="Descripción opcional..."
                            rows={2}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    description: e.target.value,
                                })
                            }
                        />
                    </FormField>

                    <FormField
                        label="Precio (entero, sin decimales)"
                        description="En bolivianos (Bs.)"
                        required
                        error={formErrors.price}
                    >
                        <Input
                            type="number"
                            step="1"
                            min="0"
                            value={formData.price}
                            placeholder="Ej: 1000"
                            onChange={(e) => {
                                setFormData({ ...formData, price: e.target.value })
                                if (formErrors.price)
                                    setFormErrors({
                                        ...formErrors,
                                        price: undefined,
                                    })
                            }}
                        />
                    </FormField>

                    <FormField
                        label="Categoría"
                        required
                        error={formErrors.categoryId}
                    >
                        <Select
                            value={formData.categoryId}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    categoryId: e.target.value,
                                })
                                if (formErrors.categoryId)
                                    setFormErrors({
                                        ...formErrors,
                                        categoryId: undefined,
                                    })
                            }}
                        >
                            <option value="">Selecciona una categoría...</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
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
                            disabled={disabled}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={disabled}
                        >
                            {disabled ? 'Guardando...' : 'Guardar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
