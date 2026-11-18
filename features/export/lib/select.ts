import type { ExportDefinition, ExportOptions, ExportSection, ExportTable } from '../model'

export function defaultOptions(definition: ExportDefinition): ExportOptions {
    const columns: Record<string, string[]> = {}
    const rows: Record<string, number[]> = {}
    for (const section of definition.sections) {
        if (section.kind !== 'table') continue
        columns[section.id] = section.table.columns.map((column) => column.key)
        rows[section.id] = section.table.rows.map((_, index) => index)
    }
    return {
        format: 'pdf',
        orientation: 'portrait',
        csvStyle: 'es',
        sections: definition.sections.map((section) => section.id),
        columns,
        rows,
    }
}

function pickTable(table: ExportTable, columns: string[] | undefined, rows: number[] | undefined): ExportTable {
    const keys = new Set(columns ?? table.columns.map((column) => column.key))
    const wanted = new Set(rows ?? table.rows.map((_, index) => index))
    return {
        ...table,
        columns: table.columns.filter((column) => keys.has(column.key)),
        rows: table.rows.filter((_, index) => wanted.has(index)),
    }
}

/** Applies the user's selection: only chosen sections, columns and rows survive. */
export function applySelection(definition: ExportDefinition, options: ExportOptions): ExportDefinition {
    const chosen = new Set(options.sections)
    const sections: ExportSection[] = []
    for (const section of definition.sections) {
        if (!chosen.has(section.id)) continue
        if (section.kind === 'table') {
            const table = pickTable(section.table, options.columns[section.id], options.rows[section.id])
            if (table.columns.length === 0 || table.rows.length === 0) continue
            sections.push({ ...section, table })
        } else sections.push(section)
    }
    return { ...definition, sections }
}

/** Sections that become tables in tabular formats (CSV/JSON). */
export function tabularSections(definition: ExportDefinition): { id: string; title: string; table: ExportTable }[] {
    const result: { id: string; title: string; table: ExportTable }[] = []
    for (const section of definition.sections) {
        if (section.kind === 'table') result.push({ id: section.id, title: section.title, table: section.table })
        if (section.kind === 'kpis') {
            result.push({
                id: section.id,
                title: section.title,
                table: {
                    rowLabelKey: 'label',
                    columns: [
                        { key: 'label', label: 'Indicador', type: 'text' },
                        { key: 'value', label: 'Valor', type: 'text' },
                        { key: 'detail', label: 'Detalle', type: 'text' },
                    ],
                    rows: section.items.map((item) => ({
                        label: item.label,
                        value: item.value,
                        detail: item.detail ?? null,
                    })),
                },
            })
        }
        if (section.kind === 'heatmap') {
            const rows: Record<string, string | number | null>[] = []
            section.rowLabels.forEach((rowLabel, r) =>
                section.colLabels.forEach((colLabel, c) => {
                    const value = section.values[r]?.[c] ?? null
                    if (value !== null && value !== 0) rows.push({ row: rowLabel, col: colLabel, value })
                }),
            )
            result.push({
                id: section.id,
                title: section.title,
                table: {
                    rowLabelKey: 'row',
                    columns: [
                        { key: 'row', label: 'Día', type: 'text' },
                        { key: 'col', label: 'Hora', type: 'text' },
                        { key: 'value', label: 'Valor', type: section.valueType },
                    ],
                    rows,
                },
            })
        }
    }
    return result
}
