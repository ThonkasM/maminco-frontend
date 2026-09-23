import { TableResponse, CreateTablePayload } from '@/features/tables/api'
import { AreaResponse } from '@/features/areas/api'
import { TableForm } from './TableForm'

interface FormModalProps {
  table?: TableResponse
  areas: AreaResponse[]
  onSubmit: (formData: CreateTablePayload) => Promise<void>
  onCancel: () => void
  submitting?: boolean
}

export function FormModal({ table, areas, onSubmit, onCancel, submitting = false }: FormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">{table ? 'Editar Mesa' : 'Nueva Mesa'}</h3>
        <TableForm table={table} areas={areas} onSubmit={onSubmit} onCancel={onCancel} submitting={submitting} />
      </div>
    </div>
  )
}
