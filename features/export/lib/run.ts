import type { ChartImages, ExportDefinition, ExportOptions } from '../model'
import { exportCsv } from './csv'
import { fileStamp, slug } from './format'
import { exportJson } from './json'
import { rasterizeChart } from './rasterize'
import { applySelection } from './select'

export const FORMAT_INFO: Record<ExportOptions['format'], { label: string; ext: string; description: string; charts: boolean }> = {
    pdf: { label: 'PDF', ext: 'pdf', description: 'Informe ejecutivo listo para imprimir o compartir, con gráficos.', charts: true },
    xlsx: { label: 'Excel', ext: 'xlsx', description: 'Libro con una hoja por tabla, filtros y los gráficos incluidos.', charts: true },
    csv: { label: 'CSV', ext: 'csv', description: 'Tablas en texto plano. Varias tablas se entregan en un .zip.', charts: false },
    json: { label: 'JSON', ext: 'json', description: 'Datos estructurados para otros sistemas o análisis.', charts: false },
}

export async function runExport(definition: ExportDefinition, options: ExportOptions, author: string) {
    const selected = applySelection(definition, options)
    if (selected.sections.length === 0) throw new Error('Selecciona al menos una sección con datos.')
    const base = `${slug(definition.filename)}-${fileStamp()}`

    if (options.format === 'csv') return exportCsv(selected, options, base)
    if (options.format === 'json') return exportJson(selected, base)

    const images: ChartImages = {}
    for (const section of selected.sections) {
        if (section.kind === 'chart') images[section.id] = (await rasterizeChart(section.selector)) ?? undefined
    }
    if (options.format === 'pdf') {
        const { exportPdf } = await import('./pdf')
        return exportPdf(selected, options, images, base, author)
    }
    const { exportXlsx } = await import('./xlsx')
    return exportXlsx(selected, images, base, author)
}
