import { donutLegend } from '@/components/charts'
import type { ExportDefinition, ExportSection } from '@/features/export/model'
import type {
    BreakdownItem,
    HeatmapCell,
    ReportComparison,
    ReportSummary,
    ReportTopProduct,
    TimeSeriesPoint,
} from './api'

const WEEKDAYS = [
    { weekday: 1, label: 'Lun', long: 'lunes' },
    { weekday: 2, label: 'Mar', long: 'martes' },
    { weekday: 3, label: 'Mié', long: 'miércoles' },
    { weekday: 4, label: 'Jue', long: 'jueves' },
    { weekday: 5, label: 'Vie', long: 'viernes' },
    { weekday: 6, label: 'Sáb', long: 'sábado' },
    { weekday: 0, label: 'Dom', long: 'domingo' },
]

export interface ReportsExportInput {
    from: string
    to: string
    days: number
    areaName?: string
    tableName?: string
    dimensionLabel: string
    summary?: ReportSummary
    comparison?: ReportComparison
    timeSeries: TimeSeriesPoint[]
    previousSeries?: TimeSeriesPoint[]
    heatmap: HeatmapCell[]
    breakdown: BreakdownItem[]
    breakdownView?: 'bars' | 'donut'
    payment?: BreakdownItem[]
    category?: BreakdownItem[]
    shift?: BreakdownItem[]
    shiftName?: string
    topProducts: ReportTopProduct[]
}

const bs = (value: number) =>
    `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const num = (value: number) => value.toLocaleString('es-BO')
const pct = (value: number, digits = 1) => `${value.toLocaleString('es-BO', { maximumFractionDigits: digits })} %`
const signed = (value: number) => `${value >= 0 ? '+' : ''}${pct(value)}`

export function reportInsights(input: ReportsExportInput): string[] {
    const { summary, comparison, heatmap, topProducts, days } = input
    if (!summary || summary.totalOrders === 0) return ['No hubo ventas registradas en el periodo seleccionado.']
    const lines: string[] = []

    lines.push(
        `Entre el ${input.from} y el ${input.to} (${days} día${days === 1 ? '' : 's'}) se vendieron ${bs(summary.totalSales)} en ${num(summary.totalOrders)} órdenes, con un ticket promedio de ${bs(summary.averageOrderValue)} y ${bs(summary.totalSales / Math.max(days, 1))} de venta diaria promedio.`,
    )

    if (comparison && comparison.previous.totalSales > 0) {
        const delta = comparison.deltas.totalSales
        const orders = comparison.deltas.totalOrders
        const ticket = comparison.deltas.averageOrderValue
        const direction = delta === null ? 'sin variación calculable' : delta >= 0 ? `crecieron ${pct(delta)}` : `cayeron ${pct(Math.abs(delta))}`
        const cause =
            orders !== null && ticket !== null
                ? ` Las órdenes variaron ${signed(orders)} y el ticket promedio ${signed(ticket)}${
                      Math.abs(orders) >= Math.abs(ticket)
                          ? ', por lo que el cambio se explica sobre todo por el volumen de clientes.'
                          : ', por lo que el cambio se explica sobre todo por cuánto gasta cada cliente.'
                  }`
                : ''
        lines.push(`Frente al periodo anterior de igual duración (${bs(comparison.previous.totalSales)}), las ventas ${direction}.${cause}`)
    }

    const best = [...heatmap].sort((a, b) => b.totalSales - a.totalSales)[0]
    if (best && best.totalSales > 0) {
        const day = WEEKDAYS.find((item) => item.weekday === best.weekday)?.long ?? ''
        const total = heatmap.reduce((sum, cell) => sum + cell.totalSales, 0)
        lines.push(
            `La franja más fuerte es ${day} a las ${String(best.hour).padStart(2, '0')}h (${bs(best.totalSales)}, ${pct((best.totalSales / total) * 100)} de las ventas del periodo). Conviene reforzar personal e insumos en esa franja.`,
        )
    }

    const top = topProducts[0]
    if (top && summary.totalSales > 0) {
        const share = (top.totalRevenue / summary.totalSales) * 100
        const top3 = topProducts.slice(0, 3).reduce((sum, item) => sum + item.totalRevenue, 0)
        lines.push(
            `El producto líder es ${top.productName} con ${bs(top.totalRevenue)} (${pct(share)} de la venta); los tres primeros concentran ${pct((top3 / summary.totalSales) * 100)}.`,
        )
    }

    const gross = summary.totalSales + summary.totalDiscount
    if (gross > 0 && summary.totalDiscount > 0) {
        const rate = (summary.totalDiscount / gross) * 100
        lines.push(
            `Los descuentos suman ${bs(summary.totalDiscount)} (${pct(rate)} de la venta bruta)${rate >= 5 ? ': supera el 5 %, conviene revisar quién los autoriza y en qué órdenes.' : '.'}`,
        )
    }
    return lines
}

export interface BreakdownExportInput {
    id: string
    label: string
    items: BreakdownItem[]
    selector: string
    donut?: boolean
}

export function breakdownSections({ id, label, items, selector, donut }: BreakdownExportInput): ExportSection[] {
    if (items.length === 0) return []
    const total = items.reduce((sum, item) => sum + item.totalSales, 0)
    return [
        {
            id: `chart-${id}`,
            kind: 'chart',
            title: `Ventas por ${label.toLowerCase()}`,
            selector: `[data-export-chart="${selector}"]`,
            legend: donut
                ? donutLegend(items.map((item) => ({ label: item.label, value: item.totalSales })))
                : [{ label: 'Ventas (Bs.)', color: 'var(--primary)' }],
        },
        {
            id: `table-${id}`,
            kind: 'table',
            title: `Desglose por ${label.toLowerCase()}`,
            table: {
                rowLabelKey: 'label',
                columns: [
                    { key: 'label', label, type: 'text' },
                    { key: 'sales', label: 'Ventas', type: 'currency' },
                    { key: 'orders', label: 'Órdenes', type: 'integer' },
                    { key: 'ticket', label: 'Ticket promedio', type: 'currency' },
                    { key: 'share', label: '% de la venta', type: 'percent' },
                ],
                rows: items.map((item) => ({
                    label: item.label,
                    sales: item.totalSales,
                    orders: item.totalOrders,
                    ticket: item.totalOrders > 0 ? item.totalSales / item.totalOrders : 0,
                    share: total > 0 ? (item.totalSales / total) * 100 : 0,
                })),
            },
        },
    ]
}

export function buildReportsExport(input: ReportsExportInput): ExportDefinition {
    const { summary, comparison } = input
    const sections: ExportSection[] = []

    sections.push({ id: 'summary', kind: 'summary', title: 'Resumen ejecutivo', paragraphs: reportInsights(input) })

    if (summary) {
        const delta = (metric: keyof NonNullable<typeof comparison>['deltas']) => {
            const value = comparison?.deltas[metric]
            return value === null || value === undefined ? undefined : `${signed(value)} vs periodo anterior`
        }
        sections.push({
            id: 'kpis',
            kind: 'kpis',
            title: 'Indicadores del periodo',
            items: [
                { label: 'Ventas', value: bs(summary.totalSales), detail: delta('totalSales') },
                {
                    label: 'Órdenes',
                    value: num(summary.totalOrders),
                    detail: delta('totalOrders') ?? `${num(summary.tableOrders)} en mesa · ${num(summary.virtualOrders)} virtuales`,
                },
                { label: 'Ticket promedio', value: bs(summary.averageOrderValue), detail: delta('averageOrderValue') },
                { label: 'Ítems por pedido', value: summary.averageItemsPerOrder.toFixed(1) },
                { label: 'Descuentos', value: bs(summary.totalDiscount), detail: delta('totalDiscount') },
                { label: 'Propinas', value: bs(summary.totalTips), detail: delta('totalTips') },
                { label: 'Venta diaria promedio', value: bs(summary.totalSales / Math.max(input.days, 1)), detail: `${input.days} días` },
                {
                    label: 'Periodo anterior',
                    value: comparison ? bs(comparison.previous.totalSales) : '—',
                    detail: comparison ? `${num(comparison.previous.totalOrders)} órdenes` : undefined,
                },
            ],
        })
    }

    if (input.timeSeries.length > 0) {
        const hasPrevious = Boolean(input.previousSeries?.length)
        sections.push({
            id: 'chart-trend',
            kind: 'chart',
            title: 'Tendencia de ventas',
            selector: '[data-export-chart="reports-trend"]',
            legend: [
                { label: 'Ventas (Bs.)', color: 'var(--chart-1)' },
                ...(hasPrevious ? [{ label: 'Periodo anterior (Bs.)', color: 'var(--chart-3)' }] : []),
                { label: 'Órdenes', color: 'var(--chart-2)' },
            ],
        })
        sections.push({
            id: 'table-trend',
            kind: 'table',
            title: 'Ventas por periodo',
            table: {
                rowLabelKey: 'period',
                columns: [
                    { key: 'period', label: 'Periodo', type: 'text' },
                    { key: 'sales', label: 'Ventas', type: 'currency' },
                    { key: 'orders', label: 'Órdenes', type: 'integer' },
                    { key: 'ticket', label: 'Ticket promedio', type: 'currency' },
                    ...(hasPrevious ? [{ key: 'previous', label: 'Ventas periodo anterior', type: 'currency' as const }] : []),
                ],
                rows: input.timeSeries.map((point, index) => ({
                    period: point.period,
                    sales: point.totalSales,
                    orders: point.totalOrders,
                    ticket: point.totalOrders > 0 ? point.totalSales / point.totalOrders : 0,
                    previous: input.previousSeries?.[index]?.totalSales ?? null,
                })),
            },
        })
    }

    if (input.heatmap.length > 0) {
        const hours = input.heatmap.map((cell) => cell.hour)
        const first = Math.min(...hours)
        const last = Math.max(...hours)
        const colLabels = Array.from({ length: last - first + 1 }, (_, i) => String(first + i).padStart(2, '0'))
        const grid = (metric: 'totalSales' | 'totalOrders') =>
            WEEKDAYS.map((day) =>
                colLabels.map((_, i) => {
                    const cell = input.heatmap.find((item) => item.weekday === day.weekday && item.hour === first + i)
                    return cell ? cell[metric] : 0
                }),
            )
        sections.push({
            id: 'heatmap-sales',
            kind: 'heatmap',
            title: 'Mapa de calor: ventas por día y hora',
            rowLabels: WEEKDAYS.map((day) => day.label),
            colLabels,
            values: grid('totalSales'),
            valueType: 'currency',
        })
        sections.push({
            id: 'heatmap-orders',
            kind: 'heatmap',
            title: 'Mapa de calor: órdenes por día y hora',
            rowLabels: WEEKDAYS.map((day) => day.label),
            colLabels,
            values: grid('totalOrders'),
            valueType: 'integer',
        })
    }

    sections.push(...breakdownSections({ id: 'breakdown', label: input.dimensionLabel, items: input.breakdown, selector: 'reports-breakdown', donut: input.breakdownView === 'donut' }))
    sections.push(
        ...breakdownSections({ id: 'payment', label: 'Método de pago', items: input.payment ?? [], selector: 'reports-payment', donut: true }),
        ...breakdownSections({ id: 'category', label: 'Categoría', items: input.category ?? [], selector: 'reports-category', donut: true }),
        ...breakdownSections({ id: 'shift', label: 'Turno', items: input.shift ?? [], selector: 'reports-shift', donut: true }),
    )

    if (input.topProducts.length > 0) {
        const totalSales = summary?.totalSales ?? 0
        sections.push({
            id: 'table-products',
            kind: 'table',
            title: 'Productos más vendidos',
            table: {
                rowLabelKey: 'name',
                columns: [
                    { key: 'name', label: 'Producto', type: 'text' },
                    { key: 'category', label: 'Categoría', type: 'text' },
                    { key: 'quantity', label: 'Unidades', type: 'integer' },
                    { key: 'price', label: 'Precio unitario', type: 'currency' },
                    { key: 'revenue', label: 'Ingresos', type: 'currency' },
                    { key: 'share', label: '% de la venta', type: 'percent' },
                ],
                rows: input.topProducts.map((item) => ({
                    name: item.productName,
                    category: item.categoryName,
                    quantity: item.quantitySold,
                    price: item.unitPrice,
                    revenue: item.totalRevenue,
                    share: totalSales > 0 ? (item.totalRevenue / totalSales) * 100 : null,
                })),
            },
        })
    }

    return {
        filename: `reporte-ventas-${input.from}-a-${input.to}`,
        title: 'Reporte de ventas',
        subtitle: 'Qué pasó: ventas, órdenes y rentabilidad del periodo',
        meta: [
            { label: 'Periodo', value: `${input.from} al ${input.to}` },
            { label: 'Área', value: input.areaName ?? 'Todas' },
            { label: 'Mesa', value: input.tableName ?? 'Todas' },
            ...(input.shiftName ? [{ label: 'Turno', value: input.shiftName }] : []),
        ],
        sections,
    }
}
