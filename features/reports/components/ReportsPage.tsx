'use client'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getActiveAreas } from '@/features/areas/api'
import { getTables } from '@/features/tables/api'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    buildPresetRange,
    diffDays,
    todayInBusinessTz,
    type ReportPresetId,
} from '@/lib/utils/reportRange'
import type { BreakdownDimension } from '../api'
import {
    useReportBreakdown,
    useReportSummary,
    useReportTimeSeries,
    useReportTopProducts,
} from '../hooks/useReports'
import { RangeControls } from './RangeControls'
import { ReportKpis } from './ReportKpis'
import { SalesTrendChart } from './SalesTrendChart'
import { BreakdownCard } from './BreakdownCard'
import { TopProductsTable } from './TopProductsTable'

export function ReportsPage() {
    const today = todayInBusinessTz()

    const [preset, setPreset] = useState<ReportPresetId>('today')
    const [customFrom, setCustomFrom] = useState(today)
    const [customTo, setCustomTo] = useState(today)
    const [areaId, setAreaId] = useState('')
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
        const ordered = base.from > base.to
            ? { from: base.to, to: base.from }
            : base
        return {
            from: ordered.from,
            to: ordered.to,
            areaId: areaId || undefined,
            tableId: tableId || undefined,
        }
    }, [preset, customFrom, customTo, today, areaId, tableId])

    const rangeLength = diffDays(range.from, range.to) + 1
    const groupBy =
        groupByOverride ?? (rangeLength > 62 ? 'month' : 'day')

    const summary = useReportSummary(range)
    const timeSeries = useReportTimeSeries(range, groupBy)
    const breakdown = useReportBreakdown(range, dimension)
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Reportes
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Analiza las ventas del restaurante por rango de fechas
                </p>
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
                areas={areasQuery.data ?? []}
                tables={tables}
                loadingFilters={
                    areasQuery.isLoading || tablesQuery.isLoading
                }
            />

            <ReportKpis
                summary={summary.data}
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

            <BreakdownCard
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
