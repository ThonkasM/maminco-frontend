'use client'
import { useDashboardReports } from '@/features/dashboard/hooks/useDashboardReports'
import { TopProductsTable, SalesSummaryCard } from '@/features/dashboard/components/ReportTables'
import { TopProductsBarChart } from '@/features/dashboard/components/ReportCharts'

export default function DashboardPage() {
  const { state, refresh } = useDashboardReports()

  const dailyReport = state.data.dailyReport

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">📊 Dashboard de Reportes</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Reportes del día actual</p>
          </div>
          <button
            onClick={refresh}
            disabled={state.loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
          >
            ↻ Actualizar
          </button>
        </div>

        {/* Error Alert */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm font-medium text-red-800 dark:text-red-400">❌ Error: {state.error}</p>
          </div>
        )}

        {/* Loading State */}
        {state.loading && !dailyReport && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mt-4">Cargando reportes...</p>
          </div>
        )}

        {/* Daily Summary Card */}
        {dailyReport && (
          <div className="mt-6">
            <SalesSummaryCard sales={dailyReport.sales} loading={state.loading} />
          </div>
        )}

        {/* Charts and Tables Section */}
        {dailyReport && (
          <div className="space-y-6 mt-6">
            {/* Top Products Chart */}
            <div>
              <TopProductsBarChart data={dailyReport.topProducts} loading={state.loading} />
            </div>

            {/* Top Products Table */}
            <div>
              <TopProductsTable products={dailyReport.topProducts} loading={state.loading} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}