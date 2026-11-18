import type { ExportDefinition, ExportSection } from '@/features/export/model'
import { breakdownSections, buildReportsExport, type ReportsExportInput } from '@/features/reports/export'
import type { BreakdownItem } from '@/features/reports/api'

export interface DashboardExportInput extends ReportsExportInput {
    payment: BreakdownItem[]
    area: BreakdownItem[]
    category: BreakdownItem[]
    waiter: BreakdownItem[]
    hourly: BreakdownItem[]
    shift: BreakdownItem[]
    periodLabel: string
}

export function buildDashboardExport(input: DashboardExportInput): ExportDefinition {
    const base = buildReportsExport({ ...input, breakdown: [], payment: [], category: [], shift: [], dimensionLabel: 'Hora' })
    const extra: ExportSection[] = [
        ...breakdownSections({ id: 'payment', label: 'Método de pago', items: input.payment, selector: 'dashboard-payment', donut: true }),
        ...breakdownSections({ id: 'shift', label: 'Turno', items: input.shift, selector: 'dashboard-shift', donut: true }),
        ...breakdownSections({ id: 'area', label: 'Área', items: input.area, selector: 'dashboard-area', donut: true }),
        ...breakdownSections({ id: 'category', label: 'Categoría', items: input.category, selector: 'dashboard-category', donut: true }),
        ...breakdownSections({ id: 'waiter', label: 'Mesero', items: input.waiter, selector: 'dashboard-waiter' }).filter(
            (section) => section.kind !== 'chart',
        ),
    ]
    if (input.timeSeries.length === 0 && input.hourly.length > 0) {
        extra.unshift(
            ...breakdownSections({
                id: 'hour',
                label: 'Hora',
                items: [...input.hourly].sort((a, b) => a.key.localeCompare(b.key)),
                selector: 'reports-trend',
            }),
        )
    }
    const index = base.sections.findIndex((section) => section.id === 'table-products')
    const sections = [...base.sections]
    sections.splice(index === -1 ? sections.length : index, 0, ...extra)
    return {
        ...base,
        filename: `dashboard-${input.from}-a-${input.to}`,
        title: 'Resumen gerencial',
        subtitle: `Dashboard · ${input.periodLabel}`,
        sections,
    }
}
