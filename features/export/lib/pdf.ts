import type { jsPDF } from 'jspdf'
import type { ChartImages, ExportDefinition, ExportOptions } from '../model'
import { resolveColor } from './rasterize'
import { downloadBlob } from './download'
import { formatCell, isNumeric, timestampLabel } from './format'

type RGB = [number, number, number]

const CHARCOAL: RGB = [28, 26, 23]
const LEAF: RGB = [53, 112, 26]
const CREAM: RGB = [244, 239, 228]
const INK: RGB = [26, 23, 19]
const MUTED: RGB = [112, 104, 92]
const LINE: RGB = [229, 220, 203]
const PAPER: RGB = [250, 247, 240]
const MARGIN = 14

function parseColor(value: string): RGB {
    const match = resolveColor(value).match(/\d+(\.\d+)?/g)
    if (!match || match.length < 3) return LEAF
    return [Number(match[0]), Number(match[1]), Number(match[2])]
}

async function loadLogo(): Promise<string | null> {
    try {
        const response = await fetch('/maminco-logo-128.png')
        if (!response.ok) return null
        const blob = await response.blob()
        return await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(String(reader.result))
            reader.onerror = reject
            reader.readAsDataURL(blob)
        })
    } catch {
        return null
    }
}

interface Layout {
    doc: jsPDF
    width: number
    height: number
    y: number
}

export async function exportPdf(
    definition: ExportDefinition,
    options: ExportOptions,
    images: ChartImages,
    base: string,
    author: string,
) {
    const [{ jsPDF: JsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
    const doc = new JsPDF({ orientation: options.orientation, unit: 'mm', format: 'a4', compress: true })
    const logo = await loadLogo()
    const layout: Layout = {
        doc,
        width: doc.internal.pageSize.getWidth(),
        height: doc.internal.pageSize.getHeight(),
        y: 0,
    }
    const contentWidth = layout.width - MARGIN * 2
    const bottom = () => layout.height - 16

    const ensure = (needed: number) => {
        if (layout.y + needed > bottom()) {
            doc.addPage()
            layout.y = 18
        }
    }

    const heading = (text: string) => {
        ensure(14)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(...INK)
        doc.text(text, MARGIN, layout.y)
        doc.setDrawColor(...LEAF)
        doc.setLineWidth(0.8)
        doc.line(MARGIN, layout.y + 2, MARGIN + 12, layout.y + 2)
        layout.y += 8
    }

    // Cover band
    doc.setFillColor(...CHARCOAL)
    doc.rect(0, 0, layout.width, 34, 'F')
    doc.setFillColor(...LEAF)
    doc.rect(0, 34, layout.width, 1.6, 'F')
    let textX = MARGIN
    if (logo) {
        doc.addImage(logo, 'PNG', MARGIN, 8, 18, 18)
        textX = MARGIN + 24
    }
    doc.setTextColor(...CREAM)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.text('MAMINCO · SISTEMA DE GESTIÓN', textX, 13)
    doc.setFontSize(19)
    doc.text(definition.title, textX, 22, { maxWidth: layout.width - textX - MARGIN })
    if (definition.subtitle) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(9.5)
        doc.setTextColor(214, 206, 190)
        doc.text(definition.subtitle, textX, 29, { maxWidth: layout.width - textX - MARGIN })
    }
    layout.y = 44

    // Metadata
    const meta = [
        ...definition.meta,
        { label: 'Generado', value: timestampLabel() },
        { label: 'Por', value: author },
    ]
    doc.setFontSize(8.5)
    const columns = options.orientation === 'landscape' ? 4 : 3
    const cell = contentWidth / columns
    meta.forEach((item, index) => {
        const col = index % columns
        const row = Math.floor(index / columns)
        const x = MARGIN + col * cell
        const y = layout.y + row * 9
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...MUTED)
        doc.text(item.label.toUpperCase(), x, y)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(...INK)
        doc.text(item.value, x, y + 4, { maxWidth: cell - 4 })
    })
    layout.y += Math.ceil(meta.length / columns) * 9 + 6

    for (const section of definition.sections) {
        if (section.kind === 'summary') {
            heading(section.title)
            doc.setFontSize(10)
            doc.setFont('helvetica', 'normal')
            for (const paragraph of section.paragraphs) {
                const lines = doc.splitTextToSize(paragraph, contentWidth - 8) as string[]
                const height = lines.length * 4.8 + 3
                ensure(height)
                doc.setFillColor(...LEAF)
                doc.rect(MARGIN, layout.y - 3.2, 1, height - 2, 'F')
                doc.setTextColor(...INK)
                doc.text(lines, MARGIN + 4, layout.y)
                layout.y += height
            }
            layout.y += 3
        }

        if (section.kind === 'kpis') {
            ensure(36)
            heading(section.title)
            const perRow = options.orientation === 'landscape' ? 4 : 3
            const gap = 3
            const width = (contentWidth - gap * (perRow - 1)) / perRow
            section.items.forEach((item, index) => {
                const col = index % perRow
                if (col === 0) ensure(22)
                const x = MARGIN + col * (width + gap)
                const y = layout.y
                doc.setFillColor(...PAPER)
                doc.setDrawColor(...LINE)
                doc.setLineWidth(0.2)
                doc.roundedRect(x, y - 3, width, 19, 1.5, 1.5, 'FD')
                doc.setFont('helvetica', 'bold')
                doc.setFontSize(7.5)
                doc.setTextColor(...MUTED)
                doc.text(item.label.toUpperCase(), x + 3, y + 1.5, { maxWidth: width - 6 })
                doc.setFontSize(13)
                doc.setTextColor(...INK)
                doc.text(item.value, x + 3, y + 8, { maxWidth: width - 6 })
                if (item.detail) {
                    doc.setFont('helvetica', 'normal')
                    doc.setFontSize(7.5)
                    doc.setTextColor(...MUTED)
                    doc.text(item.detail, x + 3, y + 13, { maxWidth: width - 6 })
                }
                if (col === perRow - 1 || index === section.items.length - 1) layout.y += 22
            })
            layout.y += 2
        }

        if (section.kind === 'chart') {
            const image = images[section.id]
            if (!image) continue
            const aspect = image.height / image.width
            const maxHeight = 95
            const width = Math.min(contentWidth, 175, maxHeight / aspect)
            const height = aspect * width
            ensure(height + 22)
            heading(section.title)
            doc.setDrawColor(...LINE)
            doc.setLineWidth(0.2)
            doc.rect(MARGIN, layout.y - 1, width + 2, height + 2)
            doc.addImage(image.dataUrl, 'JPEG', MARGIN + 1, layout.y, width, height)
            layout.y += height + 5
            if (section.legend?.length) {
                let x = MARGIN
                doc.setFontSize(8)
                doc.setFont('helvetica', 'normal')
                for (const entry of section.legend) {
                    doc.setFillColor(...parseColor(entry.color))
                    doc.rect(x, layout.y - 2.4, 3, 3, 'F')
                    doc.setTextColor(...INK)
                    doc.text(entry.label, x + 4.5, layout.y)
                    x += 8 + doc.getTextWidth(entry.label)
                }
                layout.y += 5
            }
            if (section.note) {
                doc.setFontSize(8)
                doc.setTextColor(...MUTED)
                const lines = doc.splitTextToSize(section.note, contentWidth) as string[]
                doc.text(lines, MARGIN, layout.y)
                layout.y += lines.length * 3.6 + 2
            }
            layout.y += 4
        }

        if (section.kind === 'heatmap') {
            ensure(section.rowLabels.length * 7 + 26)
            heading(section.title)
            const rows = section.rowLabels.length
            const cols = section.colLabels.length
            const labelWidth = 12
            const size = Math.min(7, (contentWidth - labelWidth) / Math.max(cols, 1))
            ensure(rows * size + 12)
            const flat = section.values.flat().filter((value): value is number => typeof value === 'number')
            const max = Math.max(...flat, 1)
            doc.setFontSize(6.5)
            section.colLabels.forEach((label, c) => {
                doc.setTextColor(...MUTED)
                doc.text(label, MARGIN + labelWidth + c * size + size / 2, layout.y, { align: 'center' })
            })
            section.rowLabels.forEach((label, r) => {
                const y = layout.y + 2 + r * size
                doc.setTextColor(...INK)
                doc.setFontSize(7.5)
                doc.text(label, MARGIN, y + size * 0.65)
                section.colLabels.forEach((_, c) => {
                    const value = section.values[r]?.[c] ?? 0
                    const t = Math.min(1, Math.max(0, value / max))
                    const mix = (a: number, b: number) => Math.round(a + (b - a) * t)
                    doc.setFillColor(mix(242, 53), mix(236, 112), mix(223, 26))
                    doc.rect(MARGIN + labelWidth + c * size, y, size - 0.4, size - 0.4, 'F')
                })
            })
            layout.y += rows * size + 7
            doc.setFont('helvetica', 'normal')
            doc.setFontSize(8)
            doc.setTextColor(...MUTED)
            const best = section.values
                .flatMap((row, r) => row.map((value, c) => ({ value: value ?? 0, r, c })))
                .sort((a, b) => b.value - a.value)
                .slice(0, 3)
                .map(
                    (item) =>
                        `${section.rowLabels[item.r]} ${section.colLabels[item.c]}h (${formatCell(item.value, section.valueType)})`,
                )
            doc.text(`Mayor demanda: ${best.join(' · ')}`, MARGIN, layout.y, { maxWidth: contentWidth })
            layout.y += 9
        }

        if (section.kind === 'table') {
            ensure(40)
            heading(section.title)
            if (section.description) {
                doc.setFont('helvetica', 'normal')
                doc.setFontSize(8.5)
                doc.setTextColor(...MUTED)
                doc.text(section.description, MARGIN, layout.y - 1, { maxWidth: contentWidth })
                layout.y += 4
            }
            const { columns: cols, rows } = section.table
            autoTable(doc, {
                startY: layout.y - 2,
                margin: { left: MARGIN, right: MARGIN, bottom: 18 },
                head: [cols.map((column) => column.label)],
                body: rows.map((row) => cols.map((column) => formatCell(row[column.key], column.type))),
                styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 2, textColor: INK, lineColor: LINE, lineWidth: 0.1 },
                headStyles: { fillColor: CHARCOAL, textColor: CREAM, fontStyle: 'bold' },
                alternateRowStyles: { fillColor: PAPER },
                columnStyles: Object.fromEntries(
                    cols.map((column, index) => [index, { halign: isNumeric(column) ? 'right' : 'left' }]),
                ),
            })
            const finalY = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
            layout.y = (finalY ?? layout.y) + 10
        }
    }

    const pages = doc.getNumberOfPages()
    for (let page = 1; page <= pages; page++) {
        doc.setPage(page)
        doc.setDrawColor(...LINE)
        doc.setLineWidth(0.2)
        doc.line(MARGIN, layout.height - 11, layout.width - MARGIN, layout.height - 11)
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...MUTED)
        doc.text('Maminco · Documento de uso interno y confidencial', MARGIN, layout.height - 7)
        doc.text(`Página ${page} de ${pages}`, layout.width - MARGIN, layout.height - 7, { align: 'right' })
    }

    downloadBlob(doc.output('blob'), `${base}.pdf`)
}
