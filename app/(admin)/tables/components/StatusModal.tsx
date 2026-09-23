import { useState } from 'react'
import { TableResponse, TableStatus } from '@/lib/api/admin/tables'

interface StatusModalProps {
  table: TableResponse
  onConfirm: (status: TableStatus) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function StatusModal({ table, onConfirm, onCancel, loading = false }: StatusModalProps) {
  const [newStatus, setNewStatus] = useState<TableStatus>(table.status)

  const handleConfirmClick = async () => {
    await onConfirm(newStatus)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg max-w-sm w-full p-6">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Cambiar estado de table</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Table <strong>#{table.number}</strong>
        </p>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Nuevo estado</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value as TableStatus)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value="AVAILABLE">Disponible</option>
            <option value="OCCUPIED">Ocupada</option>
            <option value="RESERVED">Reservada</option>
          </select>
        </div>

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
            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-all"
          >
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
        </div>
      </div>
    </div>
  )
}
