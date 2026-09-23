'use client'
import { useState, useEffect } from 'react'
import { Button, FormField, Input, Select } from '@/components/ui'
import type { TableResponse, CreateTablePayload } from '../api'
import type { AreaResponse } from '@/features/areas/api'

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
    const [formData, setFormData] = useState<CreateTablePayload>({
        number: 0,
        areaId: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    useEffect(() => {
        setFormData({
            number: table?.number ?? 0,
            areaId: table?.areaId ?? '',
        })
        setErrors({})
    }, [table])

    const validate = (): boolean => {
        const next: Record<string, string> = {}
        if (!formData.number) {
            next.number = 'El número de mesa es requerido'
        } else if (isNaN(formData.number)) {
            next.number = 'Debe ser un número'
        } else if (formData.number < 0) {
            next.number = 'El número no puede ser negativo'
        }
        if (!formData.areaId) {
            next.areaId = 'El área es requerida'
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
            <FormField
                label="Número de mesa"
                required
                error={errors.number}
            >
                <Input
                    type="number"
                    value={formData.number || ''}
                    placeholder="Ej: 1, 2, 3..."
                    onChange={(e) => {
                        setFormData({
                            ...formData,
                            number: e.target.value ? Number(e.target.value) : 0,
                        })
                        if (errors.number) setErrors({ ...errors, number: '' })
                    }}
                />
            </FormField>

            <FormField label="Área" required error={errors.areaId}>
                <Select
                    value={formData.areaId}
                    onChange={(e) => {
                        setFormData({ ...formData, areaId: e.target.value })
                        if (errors.areaId) setErrors({ ...errors, areaId: '' })
                    }}
                >
                    <option value="">Selecciona un área</option>
                    {areas.map((area) => (
                        <option key={area.id} value={area.id}>
                            {area.name}
                        </option>
                    ))}
                </Select>
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
