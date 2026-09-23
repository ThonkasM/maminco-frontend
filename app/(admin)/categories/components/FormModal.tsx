import { CategoryResponse, CreateCategoryPayload } from '@/lib/api/admin/categories'
import { CategoryForm } from './CategoryForm'

interface FormModalProps {
  category?: CategoryResponse
  existingNames: Set<string>
  onSubmit: (formData: CreateCategoryPayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function FormModal({ category, existingNames, onSubmit, onCancel, submitting = false }: FormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
        <CategoryForm category={category} existingNames={existingNames} onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} />
      </div>
    </div>
  )
}
