import { PaginatedCategoriesResponse, CategoryResponse } from '@/lib/api/admin/categories'

interface CategoryTableProps {
  categories: PaginatedCategoriesResponse
  onEdit: (category: CategoryResponse) => void
  onDelete: (category: CategoryResponse) => void
}

export function CategoryTable({ categories, onEdit, onDelete }: CategoryTableProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Nombre</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Descripción</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Productos</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {categories.data.map((category) => (
            <tr key={category.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{category.name}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{category.description || '-'}</td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{category.productsCount || 0}</td>
              <td className="px-6 py-4 text-sm">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    category.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                  }`}
                >
                  {category.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </td>
              <td className="px-6 py-4 text-sm flex gap-2 flex-wrap">
                <button onClick={() => onEdit(category)} className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                  ✏️ Editar
                </button>
                <button onClick={() => onDelete(category)} className="text-red-600 hover:text-red-800 font-medium text-sm">
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
