export const STORY_WIDTH = 1080
export const STORY_HEIGHT = 1920

export interface StoryProduct {
    name: string
    price: number
}

export interface StorySection {
    name: string
    products: StoryProduct[]
}

export type StoryBlock =
    | { kind: 'section'; name: string; y: number }
    | { kind: 'item'; lines: string[]; price: string; y: number; height: number }
    | { kind: 'note'; lines: string[]; y: number; height: number }

export interface StoryPage {
    blocks: StoryBlock[]
}

export interface Measure {
    /** Splits text so every line fits the width at the item font. */
    wrap: (text: string, width: number, font: 'item' | 'note') => string[]
}

export const GEOMETRY = {
    headerHeight: 270,
    bodyTop: 338,
    bodyBottom: STORY_HEIGHT - 70,
    marginX: 56,
    itemWidth: 440,
    priceX: 520,
    sectionHeight: 72,
    sectionGap: 40,
    itemLine: 52,
    itemPad: 30,
    noteWidth: 440,
    noteLine: 44,
    notePad: 28,
}

const formatPrice = (value: number) =>
    `Bs. ${value.toLocaleString('es-BO', { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`

/**
 * Lays the menu out on as many 9:16 pages as needed. A section title never ends a page alone,
 * and the note sits at the bottom of the last page (or gets its own page if it does not fit).
 */
export function paginate(sections: StorySection[], note: string | null, measure: Measure): StoryPage[] {
    const g = GEOMETRY
    const pages: StoryPage[] = [{ blocks: [] }]
    let y = g.bodyTop

    const noteLines = note ? measure.wrap(note, g.noteWidth - g.notePad * 2, 'note') : []
    const noteHeight = note ? noteLines.length * g.noteLine + g.notePad * 2 : 0

    const newPage = () => {
        pages.push({ blocks: [] })
        y = g.bodyTop
    }
    const itemHeight = (lines: string[]) => lines.length * g.itemLine + g.itemPad

    for (const section of sections) {
        if (section.products.length === 0) continue
        const first = section.products[0]
        const firstHeight = itemHeight(measure.wrap(first.name, g.itemWidth, 'item'))
        if (y + g.sectionHeight + firstHeight > g.bodyBottom) newPage()
        pages[pages.length - 1].blocks.push({ kind: 'section', name: section.name, y })
        y += g.sectionHeight + 10

        for (const product of section.products) {
            const lines = measure.wrap(product.name, g.itemWidth, 'item')
            const height = itemHeight(lines)
            if (y + height > g.bodyBottom) {
                newPage()
                pages[pages.length - 1].blocks.push({ kind: 'section', name: section.name, y })
                y += g.sectionHeight + 10
            }
            pages[pages.length - 1].blocks.push({ kind: 'item', lines, price: formatPrice(product.price), y, height })
            y += height
        }
        y += g.sectionGap
    }

    if (note) {
        if (y + noteHeight > g.bodyBottom + 40) newPage()
        const bottomY = STORY_HEIGHT - noteHeight
        pages[pages.length - 1].blocks.push({ kind: 'note', lines: noteLines, y: bottomY, height: noteHeight })
    }
    return pages.filter((page) => page.blocks.length > 0)
}
