import { useState, useEffect } from 'react'
import { AreaResponse, CreateAreaPayload } from '@/features/areas/api'

interface AreaFormProps {
  area?: AreaResponse
  existingNames: Set<string>
  onSubmit: (formData: CreateAreaPayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function AreaForm({ area, existingNames, onSubmit, onCancel, submitting = false }: AreaFormProps) {
  const [formData, setFormData] = useState<CreateAreaPayload>({ name: '', description: '', isVirtual: false })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        description: area.description || '',
        isVirtual: area.isVirtual || false,
      })
    } else {
      setFormData({ name: '', description: '', isVirtual: false })
    }
    setFormErrors({})
  }, [area])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'El nombre del área es requerido'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Mínimo 2 caracteres'
    } else if (!area || formData.name !== area.name) {
      if (existingNames.has(formData.name)) {
        errors.name = 'Área con este nombre ya existe'
      }
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
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre del Área</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
          }}
          className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
          placeholder="Ej: Salón, Exterior, VIP"
        />
        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descripción (Opcional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
          placeholder="Descripción del área..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
        <input
          type="checkbox"
          id="isVirtual"
          checked={formData.isVirtual || false}
          onChange={(e) => setFormData({ ...formData, isVirtual: e.target.checked })}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
        />
        <label htmlFor="isVirtual" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
          Área Virtual
          <span className="text-xs text-slate-600 dark:text-slate-400 block mt-1">
            Para servicios como Delivery o Recoger (sin tables físicas)
          </span>
        </label>
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
