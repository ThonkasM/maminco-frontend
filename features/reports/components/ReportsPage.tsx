'use client'
import dynamic from 'next/dynamic'
import { ChartSkeleton } from '@/components/shared/ChartSkeleton'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Brain, Sparkles } from 'lucide-react'
import { buttonVariants } from '@/components/ui'
import { ExportButton } from '@/features/export/components/ExportButton'
import { buildReportsExport } from '../export'
import { useQuery } from '@tanstack/react-query'
import { getActiveAreas } from '@/features/areas/api'
import { getTables } from '@/features/tables/api'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    buildPresetRange,
    diffDays,
    previousRange,
    todayInBusinessTz,
    type ReportPresetId,
} from '@/lib/utils/reportRange'
import type { BreakdownDimension } from '../api'
import {
    useReportBreakdown,
    useReportComparison,
    useReportHeatmap,
    useReportSummary,
    useReportTimeSeries,
    useReportTopProducts,
} from '../hooks/useReports'
import { useShiftConfig } from '@/features/shifts/hooks'
import { RangeControls } from './RangeControls'
import { CompositionCards } from './CompositionCards'
import { SalesHeatmap } from './SalesHeatmap'
import { ReportKpis } from './ReportKpis'
import { TopProductsTable } from './TopProductsTable'
const BreakdownCard = dynamic(
    () => import('./BreakdownCard').then((m) => m.BreakdownCard),
    { ssr: false, loading: () => <ChartSkeleton height={360} /> },
)
const SalesTrendChart = dynamic(
    () => import('./SalesTrendChart').then((m) => m.SalesTrendChart),
    { ssr: false, loading: () => <ChartSkeleton height={420} /> },
)

export function ReportsPage() {
    const today = todayInBusinessTz()

    const [preset, setPreset] = useState<ReportPresetId>('today')
    const [customFrom, setCustomFrom] = useState(today)
    const [customTo, setCustomTo] = useState(today)
    const [areaId, setAreaId] = useState('')
    const [shiftId, setShiftId] = useState('')
    const shiftConfig = useShiftConfig()
    const [tableId, setTableId] = useState('')
    const [dimension, setDimension] = useState<BreakdownDimension>('area')
    const [groupByOverride, setGroupByOverride] = useState<
        'day' | 'week' | 'month' | null
    >(null)

    const range = useMemo(() => {
        const base =
            preset === 'custom'
                ? { from: customFrom || today, to: customTo || today }
                : buildPresetRange(preset, today)
        const sorted = base.from > base.to
            ? { from: base.to, to: base.from }
            : base
        const ordered = {
            from: sorted.from > today ? today : sorted.from,
            to: sorted.to > today ? today : sorted.to,
        }
        return {
            from: ordered.from,
            to: ordered.to,
            areaId: areaId || undefined,
            shiftId: shiftId || undefined,
            tableId: tableId || undefined,
        }
    }, [preset, customFrom, customTo, today, areaId, tableId, shiftId])

    const rangeLength = diffDays(range.from, range.to) + 1
    const groupBy =
        groupByOverride ?? (rangeLength > 62 ? 'month' : 'day')

    const summary = useReportSummary(range)
    const comparison = useReportComparison(range)
    const heatmap = useReportHeatmap(range)
    const [compare, setCompare] = useState(false)
    const previousSeries = useReportTimeSeries(
        { ...range, ...previousRange(range) },
        groupBy,
        compare,
    )
    const timeSeries = useReportTimeSeries(range, groupBy)
    const [breakdownView, setBreakdownView] = useState<'bars' | 'donut'>('bars')
    const breakdown = useReportBreakdown(range, dimension)
    const payment = useReportBreakdown(range, 'paymentMethod', 8)
    const category = useReportBreakdown(range, 'category', 8)
    const shiftBreakdown = useReportBreakdown({ ...range, shiftId: undefined }, 'shift', 8)
    const topProducts = useReportTopProducts(range)

    const areasQuery = useQuery({
        queryKey: ['reports', 'areas'],
        queryFn: ({ signal }) => getActiveAreas(signal),
    })

    const tablesQuery = useQuery({
        queryKey: ['reports', 'tables'],
        queryFn: ({ signal }) => getTables(1, 500, undefined, signal),
    })

    const tables = useMemo(() => {
        const all = tablesQuery.data?.data ?? []
        return areaId ? all.filter((table) => table.areaId === areaId) : all
    }, [tablesQuery.data, areaId])

    const handleAreaChange = (value: string) => {
        setAreaId(value)
        setTableId('')
    }

    const dimensionLabel =
        { area: 'Área', table: 'Mesa', category: 'Categoría', paymentMethod: 'Método de pago', hour: 'Hora', waiter: 'Mesero', shift: 'Turno' }[dimension]

    const buildExport = () =>
        buildReportsExport({
            from: range.from,
            to: range.to,
            days: rangeLength,
            areaName: areasQuery.data?.find((area) => area.id === areaId)?.name,
            shiftName: shiftConfig.data?.shifts.find((shift) => shift.id === shiftId)?.name,
            tableName: tables.find((table) => table.id === tableId)
                ? `Mesa ${tables.find((table) => table.id === tableId)?.number}`
                : undefined,
            dimensionLabel,
            summary: summary.data,
            comparison: comparison.data,
            timeSeries: timeSeries.data ?? [],
            previousSeries: compare ? previousSeries.data : undefined,
            heatmap: heatmap.data ?? [],
            breakdown: breakdown.data ?? [],
            breakdownView,
            payment: payment.data ?? [],
            category: category.data ?? [],
            shift: shiftBreakdown.data ?? [],
            topProducts: topProducts.data ?? [],
        })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                    Reportes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Qué pasó: ventas, órdenes y rentabilidad por rango de fechas, con variación frente al periodo anterior.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <ExportButton build={buildExport} disabled={summary.isLoading} label="Exportar reporte" variant="primary" size="sm" />
                    <Link href="/insights" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                        <Sparkles />
                        Preguntar a Insights
                    </Link>
                    <Link href="/ai" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                        <Brain />
                        Ver pronóstico
                    </Link>
                </div>
            </div>

            <RangeControls
                preset={preset}
                onPresetChange={setPreset}
                customFrom={customFrom}
                customTo={customTo}
                onCustomFromChange={setCustomFrom}
                onCustomToChange={setCustomTo}
                maxDate={today}
                areaId={areaId}
                onAreaIdChange={handleAreaChange}
                tableId={tableId}
                onTableIdChange={setTableId}
                shiftId={shiftId}
                onShiftIdChange={setShiftId}
                shifts={shiftConfig.data?.shifts}
                areas={areasQuery.data ?? []}
                tables={tables}
                loadingFilters={
                    areasQuery.isLoading || tablesQuery.isLoading
                }
            />

            <ReportKpis
                summary={summary.data}
                comparison={comparison.data}
                days={rangeLength}
                loading={summary.isLoading}
                error={
                    summary.error
                        ? getErrorMessage(
                              summary.error,
                              'Error al cargar el resumen',
                          )
                        : null
                }
            />

            <SalesTrendChart
                data={timeSeries.data ?? []}
                previous={previousSeries.data}
                compare={compare}
                onCompareChange={setCompare}
                loading={timeSeries.isLoading}
                error={
                    timeSeries.error
                        ? getErrorMessage(
                              timeSeries.error,
                              'Error al cargar la tendencia',
                          )
                        : null
                }
                groupBy={groupBy}
                onGroupByChange={setGroupByOverride}
            />

            <CompositionCards payment={payment.data ?? []} category={category.data ?? []} shift={shiftBreakdown.data ?? []} loading={payment.isLoading || category.isLoading} />

            <SalesHeatmap data={heatmap.data ?? []} loading={heatmap.isLoading} />

            <BreakdownCard
                view={breakdownView}
                onViewChange={setBreakdownView}
                dimension={dimension}
                onDimensionChange={setDimension}
                items={breakdown.data ?? []}
                loading={breakdown.isLoading}
                error={
                    breakdown.error
                        ? getErrorMessage(
                              breakdown.error,
                              'Error al cargar el desglose',
                          )
                        : null
                }
            />

            <TopProductsTable
                products={topProducts.data ?? []}
                loading={topProducts.isLoading}
                error={
                    topProducts.error
                        ? getErrorMessage(
                              topProducts.error,
                              'Error al cargar los productos',
                          )
                        : null
                }
            />
        </div>
    )
}
