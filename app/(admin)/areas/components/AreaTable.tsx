import { PaginatedAreasResponse, AreaResponse } from '@/lib/api/admin/areas'

interface AreaTableProps {
  areas: PaginatedAreasResponse
  onEdit: (area: AreaResponse) => void
  onDelete: (area: AreaResponse) => void
}

export function AreaTable({ areas, onEdit, onDelete }: AreaTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Descripción</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Tipo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Mesas</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {areas.data.map((area) => (
            <tr key={area.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
              <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-white">{area.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{area.description || '-'}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${area.isVirtual
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}
                >
                  {area.isVirtual ? '☁️ Virtual' : '🏢 Física'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{area.tablesCount || 0} mesas</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${area.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                >
                  {area.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                <button onClick={() => onEdit(area)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  ✏️ Editar
                </button>
                <button onClick={() => onDelete(area)} className="text-red-600 hover:text-red-800 font-medium text-sm">
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
