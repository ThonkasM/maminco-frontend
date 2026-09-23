'use client'
import { RefreshCw } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useDashboardReports } from '../hooks/useDashboardReports'
import { AiForecastTeaser } from '@/features/ai/components/AiForecastTeaser'
import { SalesSummaryCard, TopProductsTable } from './ReportTables'
import { TopProductsBarChart } from './ReportCharts'

export function DashboardPage() {
    const { state, refresh } = useDashboardReports()
    const dailyReport = state.data.dailyReport

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Dashboard de reportes
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Reportes del día actual
                    </p>
                </div>
                <Button onClick={refresh} disabled={state.loading}>
                    <RefreshCw />
                    Actualizar
                </Button>
            </div>

            {state.error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {state.error}
                </div>
            )}

            {state.loading && !dailyReport ? (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                    <Skeleton className="h-80 w-full" />
                </div>
            ) : dailyReport ? (
                <div className="space-y-6">
                    <SalesSummaryCard
                        sales={dailyReport.sales}
                        loading={state.loading}
                    />
                    <AiForecastTeaser />
                    <TopProductsBarChart
                        data={dailyReport.topProducts}
                        loading={state.loading}
                    />
                    <TopProductsTable
                        products={dailyReport.topProducts}
                        loading={state.loading}
                    />
                </div>
            ) : null}
        </div>
    )
}
