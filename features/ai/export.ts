import type { ExportDefinition, ExportSection } from '@/features/export/model'
import type { Anomalies, MetricsSummary, PeakHours, ProductForecast, SalesForecast } from './api'

const bs = (value: number) =>
    `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const pct = (value: number) => `${value.toLocaleString('es-BO', { maximumFractionDigits: 1 })} %`

export interface AiExportInput {
    metrics?: MetricsSummary
    sales?: SalesForecast
    peakHours?: PeakHours
    products?: ProductForecast
    anomalies?: Anomalies
}

function insights({ metrics, sales, peakHours, products, anomalies }: AiExportInput): string[] {
    const lines: string[] = []
    const points = sales?.forecast ?? []
    if (points.length > 0) {
        const total = points.reduce((sum, point) => sum + point.predicted_sales, 0)
        const best = [...points].sort((a, b) => b.predicted_sales - a.predicted_sales)[0]
        let text = `Se proyectan ${bs(total)} en los próximos ${points.length} días (${bs(total / points.length)} por día). El día más fuerte sería el ${best.weekday} ${best.date} con ${bs(best.predicted_sales)}.`
        const average = metrics?.average_daily_sales
        if (average && average > 0) {
            const change = ((total / points.length - average) / average) * 100
            text += ` Frente al promedio histórico diario (${bs(average)}) eso es ${change >= 0 ? 'un aumento' : 'una caída'} de ${pct(Math.abs(change))}.`
        }
        lines.push(text)
    }
    if (sales?.model_mae != null && sales.baseline_mae != null && sales.baseline_mae > 0) {
        const gain = ((sales.baseline_mae - sales.model_mae) / sales.baseline_mae) * 100
        lines.push(
            `Confiabilidad: el modelo (${sales.chosen ?? 'seleccionado'}) se equivoca en promedio ${bs(sales.model_mae)} por día; ${gain > 0 ? `es ${pct(gain)} más preciso que la referencia simple` : 'no supera a la referencia simple, así que conviene tomar el pronóstico con cautela'}.`,
        )
    }
    if (peakHours && peakHours.top_hours.length > 0) {
        lines.push(
            `Las horas de mayor demanda son ${peakHours.top_hours.map((hour) => `${String(hour).padStart(2, '0')}h`).join(', ')}. Planifica turnos e insumos alrededor de esas franjas.`,
        )
    }
    const top = products?.forecast?.[0]
    if (top) lines.push(`El producto con mayor demanda proyectada es ${top.product_name} (${top.predicted_quantity.toLocaleString('es-BO', { maximumFractionDigits: 1 })} unidades).`)
    if (anomalies) {
        lines.push(
            anomalies.count > 0
                ? `Se detectaron ${anomalies.count} día${anomalies.count === 1 ? '' : 's'} con ventas fuera de lo esperado; revisa si respondieron a eventos, promociones o incidencias.`
                : 'No se detectaron anomalías en el histórico reciente.',
        )
    }
    return lines.length > 0 ? lines : ['Aún no hay suficiente histórico para generar conclusiones.']
}

export function buildAiExport(input: AiExportInput): ExportDefinition {
    const { metrics, sales, peakHours, products, anomalies } = input
    const sections: ExportSection[] = [
        { id: 'summary', kind: 'summary', title: 'Resumen ejecutivo', paragraphs: insights(input) },
    ]

    if (metrics && !metrics.insufficient_data) {
        sections.push({
            id: 'kpis',
            kind: 'kpis',
            title: 'Base histórica y calidad del modelo',
            items: [
                { label: 'Días de histórico', value: String(metrics.days ?? '—'), detail: metrics.last_date ? `Hasta ${metrics.last_date}` : undefined },
                { label: 'Ventas totales', value: bs(metrics.total_sales ?? 0), detail: `${(metrics.total_orders ?? 0).toLocaleString('es-BO')} órdenes` },
                { label: 'Venta diaria media', value: bs(metrics.average_daily_sales ?? 0), detail: `Ticket ${bs(metrics.average_order_value ?? 0)}` },
                {
                    label: 'Error del modelo (MAE)',
                    value: metrics.sales_model_mae != null ? bs(metrics.sales_model_mae) : '—',
                    detail: metrics.baseline_mae != null ? `Referencia ${bs(metrics.baseline_mae)}` : undefined,
                },
            ],
        })
    }

    const points = sales?.forecast ?? []
    if (points.length > 0) {
        sections.push({
            id: 'chart-forecast',
            kind: 'chart',
            title: 'Pronóstico de ventas',
            selector: '[data-export-chart="ai-forecast"]',
            legend: [
                { label: 'Modelo', color: 'var(--primary)' },
                { label: 'Referencia simple', color: 'var(--accent)' },
            ],
            note: 'El pronóstico es una estimación estadística; úsalo como guía de planificación, no como cifra garantizada.',
        })
        sections.push({
            id: 'table-forecast',
            kind: 'table',
            title: 'Ventas proyectadas por día',
            table: {
                rowLabelKey: 'date',
                columns: [
                    { key: 'date', label: 'Fecha', type: 'text' },
                    { key: 'weekday', label: 'Día', type: 'text' },
                    { key: 'sales', label: 'Ventas proyectadas', type: 'currency' },
                    { key: 'baseline', label: 'Referencia simple', type: 'currency' },
                ],
                rows: points.map((point, index) => ({
                    date: point.date,
                    weekday: point.weekday,
                    sales: point.predicted_sales,
                    baseline: sales?.baseline_forecast?.[index] ?? null,
                })),
            },
        })
    }

    if (peakHours && peakHours.profile.length > 0) {
        sections.push({
            id: 'chart-peak',
            kind: 'chart',
            title: 'Horas pico: órdenes promedio por hora',
            selector: '[data-export-chart="ai-peak-hours"]',
        })
        sections.push({
            id: 'table-peak',
            kind: 'table',
            title: 'Perfil de demanda por hora',
            table: {
                rowLabelKey: 'hour',
                columns: [
                    { key: 'hour', label: 'Hora', type: 'text' },
                    { key: 'orders', label: 'Órdenes promedio', type: 'decimal' },
                    { key: 'sales', label: 'Ventas promedio', type: 'currency' },
                    { key: 'orderShare', label: '% de las órdenes', type: 'percent' },
                    { key: 'salesShare', label: '% de las ventas', type: 'percent' },
                ],
                rows: peakHours.profile.map((point) => ({
                    hour: `${String(point.hour).padStart(2, '0')}:00`,
                    orders: point.avg_orders,
                    sales: point.avg_sales,
                    orderShare: point.order_share * 100,
                    salesShare: point.sales_share * 100,
                })),
            },
        })
    }

    if (products && products.forecast.length > 0) {
        sections.push({
            id: 'table-products',
            kind: 'table',
            title: `Demanda proyectada por producto (${products.horizon} días)`,
            table: {
                rowLabelKey: 'name',
                columns: [
                    { key: 'name', label: 'Producto', type: 'text' },
                    { key: 'category', label: 'Categoría', type: 'text' },
                    { key: 'average', label: 'Media diaria', type: 'decimal' },
                    { key: 'projected', label: 'Unidades proyectadas', type: 'decimal' },
                ],
                rows: products.forecast.map((item) => ({
                    name: item.product_name,
                    category: item.category_name,
                    average: item.average_daily_quantity,
                    projected: item.predicted_quantity,
                })),
            },
        })
    }

    if (anomalies && anomalies.anomalies.length > 0) {
        sections.push({
            id: 'table-anomalies',
            kind: 'table',
            title: 'Días con ventas fuera de lo esperado',
            table: {
                rowLabelKey: 'date',
                columns: [
                    { key: 'date', label: 'Fecha', type: 'text' },
                    { key: 'value', label: 'Ventas', type: 'currency' },
                    { key: 'z', label: 'Z-score', type: 'decimal' },
                    { key: 'direction', label: 'Tendencia', type: 'text' },
                ],
                rows: anomalies.anomalies.map((item) => ({
                    date: item.date,
                    value: item.value,
                    z: item.z_score,
                    direction: item.direction === 'high' ? 'Por encima' : 'Por debajo',
                })),
            },
        })
    }

    return {
        filename: 'pronostico-ia',
        title: 'Pronóstico y demanda con IA',
        subtitle: 'Qué pasará: proyección de ventas, horas pico y productos',
        meta: [
            { label: 'Histórico', value: metrics?.days ? `${metrics.days} días (hasta ${metrics.last_date ?? '—'})` : 'Sin datos' },
            { label: 'Horizonte', value: `${sales?.horizon ?? 7} días` },
            { label: 'Modelo', value: metrics?.sales_model_chosen ?? sales?.chosen ?? '—' },
        ],
        sections,
    }
}
