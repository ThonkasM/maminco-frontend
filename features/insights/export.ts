import type { ExportDefinition, ExportSection, ExportTable, ValueType } from '@/features/export/model'
import type { AskResult, Dataset, MonitoringReport } from './api'
import type { ThreadEntry } from './components/AnswerCard'

const FORMAT_TYPE: Record<string, ValueType> = {
    currency: 'currency',
    integer: 'integer',
    percent: 'percent',
    decimal: 'decimal',
}

function datasetTable(dataset: Dataset): ExportTable {
    const columns = dataset.columns.map((column) => ({
        key: column.name,
        label: column.label,
        type: column.kind === 'number' ? (FORMAT_TYPE[column.format ?? 'integer'] ?? 'integer') : ('text' as ValueType),
    }))
    const label = dataset.columns.find((column) => column.kind !== 'number') ?? dataset.columns[0]
    return { columns, rows: dataset.rows, rowLabelKey: label?.name ?? columns[0]?.key ?? '' }
}

export const insightChartSelector = (entryId: number, chartId: string) =>
    `[data-export-chart="insights-${entryId}-${chartId}"]`

export function answerSections(entry: ThreadEntry & { result: AskResult }, prefix: string): ExportSection[] {
    const { result } = entry
    const sections: ExportSection[] = [
        {
            id: `${prefix}-answer`,
            kind: 'summary',
            title: entry.question,
            paragraphs: [result.answer, `Periodo consultado: ${result.range.label}.`],
        },
    ]
    for (const chart of result.charts) {
        sections.push({
            id: `${prefix}-chart-${chart.id}`,
            kind: 'chart',
            title: chart.title,
            selector: insightChartSelector(entry.id, chart.id),
            legend:
                chart.type === 'pie'
                    ? undefined
                    : chart.series.map((series, index) => ({ label: series.label, color: `var(--chart-${(index % 5) + 1})` })),
            note: chart.note,
        })
    }
    for (const dataset of result.datasets) {
        sections.push({
            id: `${prefix}-data-${dataset.id}`,
            kind: 'table',
            title: dataset.title,
            table: datasetTable(dataset),
        })
    }
    return sections
}

const SEVERITY: Record<string, string> = { critical: 'Crítica', warning: 'Atención', info: 'Informativa' }

export function alertsSection(report: MonitoringReport): ExportSection[] {
    const sections: ExportSection[] = [
        { id: 'alerts-summary', kind: 'summary', title: 'Monitoreo y alertas', paragraphs: [report.summary] },
    ]
    if (report.alerts.length > 0) {
        sections.push({
            id: 'alerts-table',
            kind: 'table',
            title: 'Alertas activas',
            table: {
                rowLabelKey: 'title',
                columns: [
                    { key: 'severity', label: 'Severidad', type: 'text' },
                    { key: 'title', label: 'Alerta', type: 'text' },
                    { key: 'detail', label: 'Detalle', type: 'text' },
                ],
                rows: report.alerts.map((alert) => ({
                    severity: SEVERITY[alert.severity] ?? alert.severity,
                    title: alert.title,
                    detail: alert.detail,
                })),
            },
        })
    }
    return sections
}

export function buildInsightsExport(
    entries: ThreadEntry[],
    alerts: MonitoringReport | undefined,
    options: { single?: boolean } = {},
): ExportDefinition | null {
    const answered = entries.filter((entry): entry is ThreadEntry & { result: AskResult } => Boolean(entry.result))
    const sections: ExportSection[] = []
    if (!options.single && alerts) sections.push(...alertsSection(alerts))
    // Oldest first so the report reads like the conversation.
    ;[...answered].reverse().forEach((entry) => sections.push(...answerSections(entry, `q${entry.id}`)))
    if (sections.length === 0) return null

    const first = answered[answered.length - 1]
    return {
        filename: options.single && first ? 'insight' : 'insights-gerencial',
        title: options.single ? 'Respuesta de Insights' : 'Informe de Insights',
        subtitle: options.single && first ? first.question : 'Consultas en lenguaje natural y monitoreo',
        meta: [
            { label: 'Consultas', value: String(answered.length) },
            { label: 'Motor', value: first ? first.result.engine.model : '—' },
        ],
        sections,
    }
}
