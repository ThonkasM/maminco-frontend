import { PaginatedOrdersResponse, OrderResponseDto, OrderStatus, ServiceType } from '@/features/pos/orders/api'
import { formatCurrency } from '@/lib/utils/currency'

interface OrderTableProps {
  orders: PaginatedOrdersResponse
  onViewDetail: (order: OrderResponseDto) => void
}

export function OrderTable({ orders, onViewDetail }: OrderTableProps) {
  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      DRAFT: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      CLOSED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    }
    return colors[status]
  }

  const getServiceTypeColor = (serviceType: ServiceType) => {
    const colors: Record<ServiceType, string> = {
      MESA: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      DELIVERY: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      RECOGER: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    }
    return colors[serviceType]
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-100 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Order</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Table</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Tipo</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Items</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Total</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Estado</th>
            <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900 dark:text-white">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {orders.data.map((order) => (
            <tr key={order.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{order.orderNumber}</td>
              <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">Table {order.tableName}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getServiceTypeColor(order.serviceType)}`}>
                  {order.serviceType}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-semibold text-blue-600 dark:text-blue-400">{order.itemCount} items</td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{formatCurrency(Number(order.total))}</td>
              <td className="px-6 py-4 text-sm">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm">
                <button
                  onClick={() => onViewDetail(order)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  👁️ Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrderTable
