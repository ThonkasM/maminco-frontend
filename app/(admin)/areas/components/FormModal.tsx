import { AreaResponse, CreateAreaPayload } from '@/lib/api/admin/areas'
import { AreaForm } from './AreaForm'

interface FormModalProps {
  area?: AreaResponse
  existingNames: Set<string>
  onSubmit: (formData: CreateAreaPayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function FormModal({ area, existingNames, onSubmit, onCancel, submitting = false }: FormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{area ? 'Editar Área' : 'Nueva Área'}</h3>
        <AreaForm area={area} existingNames={existingNames} onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} />
      </div>
    </div>
  )
}
