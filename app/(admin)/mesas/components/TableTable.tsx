import { PaginatedTablesResponse, TableResponse, TableStatus } from '@/lib/api/admin/tables'

interface TableTableProps {
  tables: PaginatedTablesResponse
  onEdit: (table: TableResponse) => void
  onDelete: (table: TableResponse) => void
  onStatusChange: (table: TableResponse) => void
}

export function TableTable({ tables, onEdit, onDelete, onStatusChange }: TableTableProps) {
  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'OCUPADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
      case 'RESERVADA':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getActiveColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">#</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Área</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Pedidos</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Activa</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tables.data.map((table) => (
            <tr key={table.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">#{table.number}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{table.areaName}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold cursor-pointer ${getStatusColor(table.status)}`}
                  onClick={() => onStatusChange(table)}
                  title="Click para cambiar estado"
                >
                  {table.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{table.ordersCount || 0}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActiveColor(table.isActive)}`}>
                  {table.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                <button onClick={() => onEdit(table)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  ✏️ Editar
                </button>
                <button onClick={() => onDelete(table)} className="text-red-600 hover:text-red-800 font-medium text-sm">
                  🗑️ Desactivar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
