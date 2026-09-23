import { CategoryResponse } from '@/features/categories/api'

interface DeleteModalProps {
  category: CategoryResponse
  onConfirm: () => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function DeleteModal({ category, onConfirm, onCancel, loading = false }: DeleteModalProps) {
  const handleConfirmClick = async () => {
    await onConfirm()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Confirmar desactivación</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          ¿Está seguro de que desea desactivar la categoría <strong>{category.name}</strong>? Esta acción puede revertirse.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmClick}
            disabled={loading}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:bg-slate-400 transition-all"
          >
            {loading ? 'Desactivando...' : 'Desactivar'}
          </button>
        </div>
      </div>
    </div>
  )
}
