'use client'
import { useState, useEffect } from 'react'
import { Button, FormField, Input, Textarea } from '@/components/ui'
import type { CategoryResponse, CreateCategoryPayload } from '../api'

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
    const [formData, setFormData] = useState<CreateCategoryPayload>({
        name: '',
        description: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        setFormData({
            name: category?.name ?? '',
            description: category?.description ?? '',
        })
        setErrors({})
    }, [category])

    const validate = (): boolean => {
        const next: Record<string, string> = {}
        const name = formData.name.trim()
        if (!name) {
            next.name = 'El nombre de la categoría es requerido'
        } else if (name.length < 2) {
            next.name = 'Mínimo 2 caracteres'
        } else if (
            (!category || name.toLowerCase() !== category.name.toLowerCase()) &&
            existingNames.has(name.toLowerCase())
        ) {
            next.name = 'Ya existe una categoría con este nombre'
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!validate()) return
        await onSubmit({
            name: formData.name.trim(),
            description: formData.description?.trim() || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
                label="Nombre de la categoría"
                required
                error={errors.name}
            >
                <Input
                    value={formData.name}
                    placeholder="Ej: Bebidas, Postres, Platos principales"
                    onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                />
            </FormField>

            <FormField label="Descripción" description="Opcional">
                <Textarea
                    value={formData.description}
                    placeholder="Descripción de la categoría..."
                    rows={3}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
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
