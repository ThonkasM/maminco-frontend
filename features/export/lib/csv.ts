import { strToU8, zipSync } from 'fflate'
import type { ExportDefinition, ExportOptions, ExportTable } from '../model'
import { downloadBlob } from './download'
import { slug } from './format'
import { tabularSections } from './select'

function escapeCell(text: string, delimiter: string): string {
    return text.includes(delimiter) || /["\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function tableToCsv(table: ExportTable, style: ExportOptions['csvStyle']): string {
    const delimiter = style === 'es' ? ';' : ','
    const number = (value: number) => {
        const text = String(Math.round(value * 100) / 100)
        return style === 'es' ? text.replace('.', ',') : text
    }
    const header = table.columns.map((column) => escapeCell(column.label, delimiter)).join(delimiter)
    const lines = table.rows.map((row) =>
        table.columns
            .map((column) => {
                const value = row[column.key]
                if (value === null || value === undefined) return ''
                return typeof value === 'number' ? number(value) : escapeCell(value, delimiter)
            })
            .join(delimiter),
    )
    return `﻿${[header, ...lines].join('\r\n')}\r\n`
}

export function exportCsv(definition: ExportDefinition, options: ExportOptions, base: string) {
    const tables = tabularSections(definition)
    if (tables.length === 0) throw new Error('No hay tablas para exportar a CSV.')
    if (tables.length === 1) {
        const blob = new Blob([tableToCsv(tables[0].table, options.csvStyle)], { type: 'text/csv;charset=utf-8' })
        downloadBlob(blob, `${base}.csv`)
        return
    }
    const files: Record<string, Uint8Array> = {}
    tables.forEach(({ title, table }, index) => {
        files[`${String(index + 1).padStart(2, '0')}-${slug(title)}.csv`] = strToU8(tableToCsv(table, options.csvStyle))
    })
    const zipped = zipSync(files)
    downloadBlob(new Blob([zipped.buffer as ArrayBuffer], { type: 'application/zip' }), `${base}.zip`)
}
