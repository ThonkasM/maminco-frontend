'use client'
import { useState } from 'react'
import {
    BarChart3,
    LayoutGrid,
    LineChart,
    RefreshCw,
} from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { useDashboardReports } from '../hooks/useDashboardReports'
import { AiForecastTeaser } from '@/features/ai/components/AiForecastTeaser'
import { SalesSummaryCard, TopProductsTable } from './ReportTables'
import { TopProductsBarChart } from './ReportCharts'
import { DashboardKpis } from './DashboardKpis'
import { MiniBreakdownCard } from './MiniBreakdownCard'

type DashboardTabId = 'general' | 'revenue' | 'products'

const TABS: { id: DashboardTabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'general', label: 'Información General', icon: LayoutGrid },
    { id: 'revenue', label: 'Ingresos', icon: LineChart },
    { id: 'products', label: 'Productos', icon: BarChart3 },
]

export function DashboardPage() {
    const { state, refresh } = useDashboardReports()
    const dailyReport = state.data.dailyReport
    const [activeTab, setActiveTab] = useState<DashboardTabId>('general')

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

            <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <Button
                            key={tab.id}
                            variant={
                                activeTab === tab.id ? 'primary' : 'ghost'
                            }
                            size="sm"
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <Icon />
                            {tab.label}
                        </Button>
                    )
                })}
            </div>

            {state.error && (
                <div className="rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                    {state.error}
                </div>
            )}

            {activeTab === 'general' && (
                <div className="space-y-6">
                    {dailyReport ? (
                        <SalesSummaryCard
                            sales={dailyReport.sales}
                            loading={state.loading}
                        />
                    ) : state.loading ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ) : null}
                    <DashboardKpis />
                    <AiForecastTeaser />
                </div>
            )}

            {activeTab === 'revenue' && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <MiniBreakdownCard
                        title="Ingresos por método de pago"
                        dimension="paymentMethod"
                    />
                    <MiniBreakdownCard
                        title="Ingresos por área"
                        dimension="area"
                    />
                </div>
            )}

            {activeTab === 'products' && (
                <div className="space-y-6">
                    {dailyReport ? (
                        <>
                            <TopProductsBarChart
                                data={dailyReport.topProducts}
                                loading={state.loading}
                            />
                            <TopProductsTable
                                products={dailyReport.topProducts}
                                loading={state.loading}
                            />
                        </>
                    ) : (
                        <>
                            <Skeleton className="h-80 w-full" />
                            <Skeleton className="h-64 w-full" />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}
