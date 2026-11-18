'use client'
import { useMemo, useState } from 'react'
import {
    BadgePercent,
    CalendarDays,
    ClipboardList,
    Clock,
    DollarSign,
    HandCoins,
    Lightbulb,
    RefreshCw,
    Receipt,
    Armchair,
    BarChart3,
    LayoutGrid,
    Radio,
    Trophy,
} from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { TrendChart, type TrendRow } from '@/components/charts'
import { AiForecastTeaser } from '@/features/ai/components/AiForecastTeaser'
import { ExportButton } from '@/features/export/components/ExportButton'
import {
    useReportBreakdown,
    useReportComparison,
    useReportHeatmap,
    useReportSummary,
    useReportTimeSeries,
    useReportTopProducts,
} from '@/features/reports/hooks/useReports'
import { reportInsights } from '@/features/reports/export'
import { SalesHeatmap } from '@/features/reports/components/SalesHeatmap'
import { formatCurrency } from '@/lib/utils/currency'
import { useShiftConfig } from '@/features/shifts/hooks'
import { shiftOfMinute } from '@/features/shifts/lib'
import { BUSINESS_TIMEZONE, buildPresetRange, diffDays, previousRange, todayInBusinessTz } from '@/lib/utils/reportRange'
import { useLiveOperations } from '../hooks/useLiveOperations'
import { buildDashboardExport } from '../export'
import { AlertsStrip } from './AlertsStrip'
import { DonutCard } from './DonutCard'
import { LiveOperationsCard } from './LiveOperationsCard'
import { StatCard } from './StatCard'
import { TeamPanel } from './TeamPanel'
import { TopProductsPanel } from './TopProductsPanel'

type TabId = 'summary' | 'sales' | 'operation' | 'products'

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
    { id: 'summary', label: 'Resumen', icon: LayoutGrid },
    { id: 'sales', label: 'Ventas', icon: BarChart3 },
    { id: 'operation', label: 'Operación', icon: Radio },
    { id: 'products', label: 'Productos', icon: Trophy },
]

type Period = 'today' | 'thisWeek' | 'thisMonth'

const PERIODS: { id: Period; label: string; previous: string }[] = [
    { id: 'today', label: 'Hoy', previous: 'ayer' },
    { id: 'thisWeek', label: 'Esta semana', previous: 'la semana anterior' },
    { id: 'thisMonth', label: 'Este mes', previous: 'el periodo anterior' },
]

export function DashboardPage() {
    const queryClient = useQueryClient()
    const today = todayInBusinessTz()
    const [period, setPeriod] = useState<Period>('today')
    const [tab_, setTab] = useState<TabId>('summary')

    const range = useMemo(() => {
        const base = buildPresetRange(period, today)
        return { from: base.from, to: base.to > today ? today : base.to }
    }, [period, today])
    const days = diffDays(range.from, range.to) + 1
    const single = days === 1
    const periodInfo = PERIODS.find((item) => item.id === period) ?? PERIODS[0]

    const summary = useReportSummary(range)
    const comparison = useReportComparison(range)
    const timeSeries = useReportTimeSeries(range, 'day', !single)
    const previousSeries = useReportTimeSeries({ ...range, ...previousRange(range) }, 'day', !single)
    const hourly = useReportBreakdown(range, 'hour', 24)
    const payment = useReportBreakdown(range, 'paymentMethod', 8)
    const area = useReportBreakdown(range, 'area', 8)
    const category = useReportBreakdown(range, 'category', 8)
    const waiter = useReportBreakdown(range, 'waiter', 12)
    const shiftBreakdown = useReportBreakdown(range, 'shift', 8)
    const shiftConfig = useShiftConfig()
    const topProducts = useReportTopProducts(range, 10)
    const heatmap = useReportHeatmap(range)
    const live = useLiveOperations()

    const data = summary.data
    const deltas = comparison.data?.deltas
    const refreshing = [summary, comparison, hourly, payment, area, category, waiter, topProducts, live].some((query) => query.isFetching)

    const trendRows = useMemo<TrendRow[]>(() => {
        if (single) {
            return [...(hourly.data ?? [])]
                .sort((a, b) => a.key.localeCompare(b.key))
                .map((item) => ({ label: item.label, sales: item.totalSales, orders: item.totalOrders }))
        }
        return (timeSeries.data ?? []).map((point, index) => ({
            label: point.period.slice(5),
            sales: point.totalSales,
            orders: point.totalOrders,
            previous: previousSeries.data?.[index]?.totalSales ?? null,
        }))
    }, [single, hourly.data, timeSeries.data, previousSeries.data])

    const exportInput = () => ({
        from: range.from,
        to: range.to,
        days,
        periodLabel: periodInfo.label,
        dimensionLabel: 'Hora',
        summary: summary.data,
        comparison: comparison.data,
        timeSeries: timeSeries.data ?? [],
        previousSeries: previousSeries.data,
        heatmap: heatmap.data ?? [],
        breakdown: [],
        topProducts: topProducts.data ?? [],
        payment: payment.data ?? [],
        area: area.data ?? [],
        category: category.data ?? [],
        waiter: waiter.data ?? [],
        shift: shiftBreakdown.data ?? [],
        hourly: hourly.data ?? [],
    })

    const reading = useMemo(
        () =>
            reportInsights({
                from: range.from,
                to: range.to,
                days,
                dimensionLabel: 'Hora',
                summary: summary.data,
                comparison: comparison.data,
                timeSeries: [],
                heatmap: heatmap.data ?? [],
                breakdown: [],
                topProducts: topProducts.data ?? [],
            }).slice(0, 4),
        [range, days, summary.data, comparison.data, heatmap.data, topProducts.data],
    )

    const refresh = () => void queryClient.invalidateQueries({ queryKey: ['reports'] }).then(() => queryClient.invalidateQueries({ queryKey: ['dashboard'] }))
    const hint = `Variación frente a ${periodInfo.previous}`
    const nowParts = new Intl.DateTimeFormat('en-GB', { timeZone: BUSINESS_TIMEZONE, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date()).split(':')
    const currentShift = shiftConfig.data ? shiftOfMinute(shiftConfig.data.shifts, Number(nowParts[0]) * 60 + Number(nowParts[1])) : null
    const tablesLive = live.data?.tables

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Dashboard</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pulso del negocio: lo que pasa ahora y cómo va el periodo frente al anterior.
                        {currentShift && (
                            <span className="ml-2 inline-flex items-center rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
                                Turno actual: {currentShift.name} · {currentShift.start}–{currentShift.end}
                            </span>
                        )}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 rounded-lg border border-border bg-surface p-1" role="group" aria-label="Periodo">
                        {PERIODS.map((item) => (
                            <Button
                                key={item.id}
                                size="sm"
                                variant={period === item.id ? 'primary' : 'ghost'}
                                aria-pressed={period === item.id}
                                onClick={() => setPeriod(item.id)}
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>
                    <Button variant="secondary" size="sm" onClick={refresh} disabled={refreshing}>
                        <RefreshCw className={refreshing ? 'animate-spin' : undefined} />
                        Actualizar
                    </Button>
                    <ExportButton size="sm" label="Exportar" build={() => buildDashboardExport(exportInput())} disabled={summary.isLoading} />
                </div>
            </div>

            <AlertsStrip />

            <div role="tablist" aria-label="Secciones del dashboard" className="flex flex-wrap gap-2 border-b border-border pb-3">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <Button key={tab.id} role="tab" aria-selected={tab_ === tab.id} variant={tab_ === tab.id ? 'primary' : 'ghost'} size="sm" onClick={() => setTab(tab.id)}>
                            <Icon />
                            {tab.label}
                        </Button>
                    )
                })}
            </div>

            {tab_ === 'summary' && (
             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
                    <StatCard
                        label="Ventas"
                        icon={DollarSign}
                        loading={summary.isLoading}
                        value={formatCurrency(data?.totalSales ?? 0)}
                        delta={deltas?.totalSales}
                        deltaHint={hint}
                        detail={`${formatCurrency((data?.totalSales ?? 0) / Math.max(days, 1), false)} por día`}
                    />
                    <StatCard
                        label="Órdenes"
                        icon={ClipboardList}
                        loading={summary.isLoading}
                        value={(data?.totalOrders ?? 0).toLocaleString('es-BO')}
                        delta={deltas?.totalOrders}
                        deltaHint={hint}
                        detail={`${(data?.tableOrders ?? 0).toLocaleString('es-BO')} mesa · ${(data?.virtualOrders ?? 0).toLocaleString('es-BO')} virtual`}
                    />
                    <StatCard
                        label="Ticket promedio"
                        icon={Receipt}
                        loading={summary.isLoading}
                        value={formatCurrency(data?.averageOrderValue ?? 0)}
                        delta={deltas?.averageOrderValue}
                        deltaHint={hint}
                        detail={`${(data?.averageItemsPerOrder ?? 0).toFixed(1)} ítems por orden`}
                    />
                    <StatCard
                        label="Descuentos"
                        icon={BadgePercent}
                        loading={summary.isLoading}
                        value={formatCurrency(data?.totalDiscount ?? 0)}
                        delta={deltas?.totalDiscount}
                        inverse
                        deltaHint={hint}
                        tone={
                            data && data.totalSales + data.totalDiscount > 0 && data.totalDiscount / (data.totalSales + data.totalDiscount) > 0.05
                                ? 'warning'
                                : 'default'
                        }
                        detail={
                            data && data.totalSales + data.totalDiscount > 0
                                ? `${((data.totalDiscount / (data.totalSales + data.totalDiscount)) * 100).toFixed(1)} % de la venta bruta`
                                : undefined
                        }
                    />
                    <StatCard
                        label="Propinas"
                        icon={HandCoins}
                        loading={summary.isLoading}
                        value={formatCurrency(data?.totalTips ?? 0)}
                        delta={deltas?.totalTips}
                        deltaHint={hint}
                        detail={data && data.totalSales > 0 ? `${((data.totalTips / data.totalSales) * 100).toFixed(1)} % de la venta` : undefined}
                    />
                    <StatCard
                        label="Mesas ocupadas"
                        icon={Armchair}
                        loading={live.isLoading}
                        value={tablesLive ? `${tablesLive.occupied}/${tablesLive.total}` : '—'}
                        detail={tablesLive ? `${Math.round(tablesLive.occupancy)} % de ocupación ahora` : undefined}
                        tone={tablesLive && tablesLive.occupancy >= 90 ? 'warning' : 'default'}
                    />
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lightbulb className="size-5 text-warning" aria-hidden="true" />
                            Lectura ejecutiva
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary.isLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : (
                            <ul className="space-y-2 text-sm leading-relaxed text-foreground">
                                {reading.map((line) => (
                                    <li key={line} className="border-l-2 border-primary pl-3">
                                        {line}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {single ? <Clock className="size-5 text-muted-foreground" /> : <CalendarDays className="size-5 text-muted-foreground" />}
                                {single ? 'Ventas por hora' : 'Evolución de ventas'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {single
                                    ? 'Cómo se reparte la venta a lo largo del día'
                                    : `Ventas y órdenes por día, comparadas con ${periodInfo.previous}`}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {hourly.isLoading || (!single && timeSeries.isLoading) ? (
                                <Skeleton className="h-72 w-full" />
                            ) : trendRows.length === 0 ? (
                                <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">Sin ventas en este periodo</div>
                            ) : (
                                <TrendChart
                                    exportId="reports-trend"
                                    ariaLabel="Evolución de ventas y órdenes"
                                    height={300}
                                    rows={trendRows}
                                    series={[
                                        { key: 'sales', label: 'Ventas', color: 'var(--chart-1)', kind: 'bar', format: 'currency' },
                                        ...(!single
                                            ? [{ key: 'previous', label: `Ventas de ${periodInfo.previous}`, color: 'var(--chart-3)', kind: 'line' as const, format: 'currency' as const, dashed: true }]
                                            : []),
                                        { key: 'orders', label: 'Órdenes', color: 'var(--chart-2)', kind: 'line', axis: 'right' },
                                    ]}
                                />
                            )}
                        </CardContent>
                    </Card>
            </div>
            )}

            {tab_ === 'sales' && (
            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    <DonutCard title="Método de pago" subtitle="Cómo pagan los clientes" items={payment.data ?? []} loading={payment.isLoading} exportId="dashboard-payment" />
                    <DonutCard title="Ventas por área" subtitle="Dónde se vende" items={area.data ?? []} loading={area.isLoading} exportId="dashboard-area" />
                    <DonutCard title="Ventas por categoría" subtitle="Qué familia de productos pesa más" items={category.data ?? []} loading={category.isLoading} exportId="dashboard-category" />
                    <DonutCard title="Ventas por turno" subtitle="Qué turno vende más" items={shiftBreakdown.data ?? []} loading={shiftBreakdown.isLoading} exportId="dashboard-shift" />
                </div>
                {!single && <SalesHeatmap data={heatmap.data ?? []} loading={heatmap.isLoading} />}
            </div>
            )}

            {tab_ === 'operation' && (
            <div className="grid gap-6 xl:grid-cols-2">
                    <LiveOperationsCard />
                        <TeamPanel items={waiter.data ?? []} loading={waiter.isLoading} />
            </div>
            )}

            {tab_ === 'products' && (
            <div className="grid gap-6 xl:grid-cols-2">
                    <TopProductsPanel products={topProducts.data ?? []} totalSales={data?.totalSales ?? 0} loading={topProducts.isLoading} />
                        <AiForecastTeaser />
            </div>
            )}
        </div>
    )
}
