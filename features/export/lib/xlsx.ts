import type { ChartImages, ExportDefinition } from '../model'
import { downloadBlob } from './download'
import { timestampLabel } from './format'

const GREEN = 'FF35701A'
const CHARCOAL = 'FF1C1A17'
const CREAM = 'FFF4EFE4'

function sheetName(title: string, used: Set<string>): string {
    const base = title.replace(/[\\/?*[\]:]/g, ' ').trim().slice(0, 28) || 'Hoja'
    let name = base
    let n = 2
    while (used.has(name.toLowerCase())) name = `${base.slice(0, 26)} ${n++}`
    used.add(name.toLowerCase())
    return name
}

function numberFormat(type: string): string | undefined {
    switch (type) {
        case 'currency':
            return '"Bs." #,##0.00'
        case 'percent':
            return '0.0"%"'
        case 'decimal':
            return '#,##0.00'
        case 'integer':
            return '#,##0'
        default:
            return undefined
    }
}

export async function exportXlsx(definition: ExportDefinition, images: ChartImages, base: string, author: string) {
    const ExcelJS = (await import('exceljs')).default
    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'Maminco'
    workbook.created = new Date()
    const used = new Set<string>()

    const summarySheet = workbook.addWorksheet(sheetName('Resumen', used), {
        views: [{ showGridLines: false }],
    })
    summarySheet.columns = [{ width: 30 }, { width: 24 }, { width: 60 }]
    summarySheet.mergeCells('A1:C1')
    const title = summarySheet.getCell('A1')
    title.value = `MAMINCO · ${definition.title}`
    title.font = { bold: true, size: 16, color: { argb: CREAM } }
    title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHARCOAL } }
    title.alignment = { vertical: 'middle' }
    summarySheet.getRow(1).height = 32
    let row = 2
    if (definition.subtitle) {
        summarySheet.getCell(`A${row}`).value = definition.subtitle
        summarySheet.getCell(`A${row}`).font = { italic: true, color: { argb: 'FF70685C' } }
        row++
    }
    row++
    for (const item of [
        ...definition.meta,
        { label: 'Generado', value: timestampLabel() },
        { label: 'Por', value: author },
    ]) {
        summarySheet.getCell(`A${row}`).value = item.label
        summarySheet.getCell(`A${row}`).font = { bold: true }
        summarySheet.getCell(`B${row}`).value = item.value
        row++
    }
    row++

    for (const section of definition.sections) {
        if (section.kind === 'summary') {
            const head = summarySheet.getCell(`A${row}`)
            head.value = section.title
            head.font = { bold: true, size: 12, color: { argb: GREEN } }
            row++
            for (const paragraph of section.paragraphs) {
                summarySheet.mergeCells(`A${row}:C${row}`)
                const cell = summarySheet.getCell(`A${row}`)
                cell.value = paragraph
                cell.alignment = { wrapText: true, vertical: 'top' }
                summarySheet.getRow(row).height = Math.max(18, Math.ceil(paragraph.length / 95) * 15)
                row++
            }
            row++
        }
        if (section.kind === 'kpis') {
            const head = summarySheet.getCell(`A${row}`)
            head.value = section.title
            head.font = { bold: true, size: 12, color: { argb: GREEN } }
            row++
            for (const item of section.items) {
                summarySheet.getCell(`A${row}`).value = item.label
                summarySheet.getCell(`B${row}`).value = item.value
                summarySheet.getCell(`B${row}`).font = { bold: true }
                summarySheet.getCell(`B${row}`).alignment = { horizontal: 'right' }
                summarySheet.getCell(`C${row}`).value = item.detail ?? ''
                summarySheet.getCell(`C${row}`).font = { color: { argb: 'FF70685C' } }
                row++
            }
            row++
        }
    }

    const charts = definition.sections.filter((section) => section.kind === 'chart' && images[section.id])
    if (charts.length > 0) {
        const sheet = workbook.addWorksheet(sheetName('Gráficos', used), { views: [{ showGridLines: false }] })
        let top = 0
        for (const section of charts) {
            const image = images[section.id]
            if (!image || section.kind !== 'chart') continue
            sheet.getCell(`A${top + 1}`).value = section.title
            sheet.getCell(`A${top + 1}`).font = { bold: true, size: 12, color: { argb: GREEN } }
            const imageId = workbook.addImage({ base64: image.dataUrl, extension: 'jpeg' })
            const width = Math.min(image.width, 900)
            const height = (image.height / image.width) * width
            sheet.addImage(imageId, { tl: { col: 0, row: top + 1 }, ext: { width, height } })
            top += Math.ceil(height / 20) + 4
        }
    }

    for (const section of definition.sections) {
        if (section.kind === 'table') {
            const sheet = workbook.addWorksheet(sheetName(section.title, used))
            const { columns, rows } = section.table
            sheet.columns = columns.map((column) => ({
                header: column.label,
                key: column.key,
                width: Math.max(14, column.label.length + 4),
                style: numberFormat(column.type) ? { numFmt: numberFormat(column.type) } : {},
            }))
            rows.forEach((item) => sheet.addRow(Object.fromEntries(columns.map((column) => [column.key, item[column.key]]))))
            const header = sheet.getRow(1)
            header.height = 22
            header.eachCell((cell) => {
                cell.font = { bold: true, color: { argb: CREAM } }
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: CHARCOAL } }
                cell.alignment = { vertical: 'middle' }
            })
            sheet.views = [{ state: 'frozen', ySplit: 1 }]
            sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } }
            columns.forEach((column, index) => {
                const longest = rows.reduce((max, item) => Math.max(max, String(item[column.key] ?? '').length), column.label.length)
                sheet.getColumn(index + 1).width = Math.min(48, Math.max(12, longest + 4))
            })
        }
        if (section.kind === 'heatmap') {
            const sheet = workbook.addWorksheet(sheetName(section.title, used))
            sheet.addRow(['', ...section.colLabels.map((label) => `${label}h`)])
            const flat = section.values.flat().filter((value): value is number => typeof value === 'number')
            const max = Math.max(...flat, 1)
            section.rowLabels.forEach((label, r) => {
                const excelRow = sheet.addRow([label, ...section.colLabels.map((_, c) => section.values[r]?.[c] ?? 0)])
                excelRow.eachCell((cell, col) => {
                    if (col === 1) {
                        cell.font = { bold: true }
                        return
                    }
                    const t = Math.min(1, Math.max(0, Number(cell.value ?? 0) / max))
                    const mix = (a: number, b: number) => Math.round(a + (b - a) * t).toString(16).padStart(2, '0')
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: `FF${mix(242, 53)}${mix(236, 112)}${mix(223, 26)}`.toUpperCase() },
                    }
                    cell.font = { color: { argb: t > 0.55 ? 'FFFFFFFF' : 'FF1A1713' } }
                    cell.alignment = { horizontal: 'center' }
                    if (numberFormat(section.valueType)) cell.numFmt = numberFormat(section.valueType) as string
                })
            })
            sheet.getColumn(1).width = 8
            for (let c = 2; c <= section.colLabels.length + 1; c++) sheet.getColumn(c).width = 11
            sheet.getRow(1).font = { bold: true }
        }
    }

    const buffer = await workbook.xlsx.writeBuffer()
    downloadBlob(
        new Blob([buffer as ArrayBuffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        `${base}.xlsx`,
    )
}
