import { useState, useEffect } from 'react'
import { CategoryResponse, CreateCategoryPayload } from '@/lib/api/admin/categories'

interface CategoryFormProps {
  category?: CategoryResponse
  existingNames: Set<string>
  onSubmit: (formData: CreateCategoryPayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function CategoryForm({ category, existingNames, onSubmit, onCancel, submitting = false }: CategoryFormProps) {
  const [formData, setFormData] = useState<CreateCategoryPayload>({ name: '', description: '' })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
      })
    } else {
      setFormData({ name: '', description: '' })
    }
    setFormErrors({})
  }, [category])

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.name.trim()) {
      errors.name = 'El nombre de la categoría es requerido'
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Mínimo 2 caracteres'
    } else if (!category || formData.name.toLowerCase() !== category.name.toLowerCase()) {
      if (existingNames.has(formData.name.trim().toLowerCase())) {
        errors.name = 'Ya existe una categoría con este nombre'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await onSubmit({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
      })
    } catch (err) {
      // Error is handled by the hook
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nombre de la Categoría</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value })
            if (formErrors.name) setFormErrors({ ...formErrors, name: '' })
          }}
          className={`w-full px-4 py-2 rounded-lg border ${formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'} dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
          placeholder="Ej: Bebidas, Postres, Platos Principales"
        />
        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Descripción (Opcional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
          placeholder="Descripción de la categoría..."
          rows={3}
        />
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
