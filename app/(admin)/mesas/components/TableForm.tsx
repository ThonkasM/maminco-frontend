import { useState, useEffect } from 'react'
import { TableResponse, CreateTablePayload } from '@/lib/api/admin/tables'
import { AreaResponse } from '@/lib/api/admin/areas'

interface TableFormProps {
  table?: TableResponse
  areas: AreaResponse[]
  onSubmit: (formData: CreateTablePayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function TableForm({ table, areas, onSubmit, onCancel, submitting = false }: TableFormProps) {
  const [formData, setFormData] = useState<CreateTablePayload>({ number: 0, areaId: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number,
        areaId: table.areaId,
      })
    } else {
      setFormData({ number: 0, areaId: '' })
    }
    setFormErrors({})
  }, [table])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.number) {
      errors.number = 'El número de mesa es requerido'
    } else if (isNaN(formData.number)) {
      errors.number = 'Debe ser un número'
    } else if (formData.number < 0) {
      errors.number = 'Número no puede ser negativo'
    }

    if (!formData.areaId) {
      errors.areaId = 'El área es requerida'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit(formData)
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Número de Mesa</label>
        <input
          type="number"
          value={formData.number || ''}
          onChange={(e) => {
            setFormData({ ...formData, number: e.target.value ? Number(e.target.value) : 0 })
            if (formErrors.number) setFormErrors({ ...formErrors, number: '' })
          }}
          className={`w-full px-4 py-2 rounded-lg border ${formErrors.number ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
          placeholder="Ej: 1, 2, 3..."
        />
        {formErrors.number && <p className="text-red-600 text-sm mt-1">{formErrors.number}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Área</label>
        <select
          value={formData.areaId}
          onChange={(e) => {
            setFormData({ ...formData, areaId: e.target.value })
            if (formErrors.areaId) setFormErrors({ ...formErrors, areaId: '' })
          }}
          className={`w-full px-4 py-2 rounded-lg border ${formErrors.areaId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
        >
          <option value="">Selecciona un área</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
        {formErrors.areaId && <p className="text-red-600 text-sm mt-1">{formErrors.areaId}</p>}
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-all"
        >
          {submitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}
