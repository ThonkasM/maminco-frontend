import type { ExportDefinition } from '../model'
import { downloadBlob } from './download'

export function exportJson(definition: ExportDefinition, base: string) {
    const payload = {
        report: definition.title,
        subtitle: definition.subtitle ?? null,
        generatedAt: new Date().toISOString(),
        meta: Object.fromEntries(definition.meta.map((item) => [item.label, item.value])),
        sections: definition.sections
            .filter((section) => section.kind !== 'chart')
            .map((section) => {
                switch (section.kind) {
                    case 'summary':
                        return { id: section.id, type: 'summary', title: section.title, paragraphs: section.paragraphs }
                    case 'kpis':
                        return { id: section.id, type: 'kpis', title: section.title, items: section.items }
                    case 'heatmap':
                        return {
                            id: section.id,
                            type: 'heatmap',
                            title: section.title,
                            rows: section.rowLabels,
                            columns: section.colLabels,
                            values: section.values,
                        }
                    default:
                        return {
                            id: section.id,
                            type: 'table',
                            title: section.title,
                            columns: section.kind === 'table' ? section.table.columns : [],
                            rows: section.kind === 'table' ? section.table.rows : [],
                        }
                }
            }),
    }
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }), `${base}.json`)
}
