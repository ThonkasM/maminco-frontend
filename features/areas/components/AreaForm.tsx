'use client'
import { useState, useEffect } from 'react'
import { Button, FormField, Input, Textarea } from '@/components/ui'
import type { AreaResponse, CreateAreaPayload } from '../api'

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
    const [formData, setFormData] = useState<CreateAreaPayload>({
        name: '',
        description: '',
        isVirtual: false,
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        setFormData({
            name: area?.name ?? '',
            description: area?.description ?? '',
            isVirtual: area?.isVirtual ?? false,
        })
        setErrors({})
    }, [area])

    const validate = (): boolean => {
        const next: Record<string, string> = {}
        const name = formData.name.trim()
        if (!name) {
            next.name = 'El nombre del área es requerido'
        } else if (name.length < 2) {
            next.name = 'Mínimo 2 caracteres'
        } else if ((!area || name !== area.name) && existingNames.has(name)) {
            next.name = 'Ya existe un área con este nombre'
        }
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!validate()) return
        await onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Nombre del área" required error={errors.name}>
                <Input
                    value={formData.name}
                    placeholder="Ej: Salón, Exterior, VIP"
                    onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value })
                        if (errors.name) setErrors({ ...errors, name: '' })
                    }}
                />
            </FormField>

            <FormField label="Descripción" description="Opcional">
                <Textarea
                    value={formData.description}
                    placeholder="Descripción del área..."
                    rows={3}
                    onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                    }
                />
            </FormField>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border bg-surface-muted/50 p-3">
                <input
                    type="checkbox"
                    checked={formData.isVirtual || false}
                    onChange={(e) =>
                        setFormData({ ...formData, isVirtual: e.target.checked })
                    }
                    className="mt-0.5 size-4 rounded border-border accent-primary"
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
