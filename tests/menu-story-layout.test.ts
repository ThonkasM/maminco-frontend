import { describe, expect, it } from 'vitest'
import { GEOMETRY, paginate, type Measure } from '@/features/menu/export/layout'

const measure: Measure = {
    wrap: (text, width) => {
        const perLine = Math.floor(width / 20)
        const words = text.split(' ')
        const lines: string[] = []
        let current = ''
        for (const word of words) {
            if ((current + ' ' + word).trim().length > perLine) {
                lines.push(current)
                current = word
            } else current = (current + ' ' + word).trim()
        }
        if (current) lines.push(current)
        return lines
    },
}

const section = (name: string, count: number) => ({
    name,
    products: Array.from({ length: count }, (_, i) => ({ name: `Plato ${i + 1}`, price: 50 + i })),
})

describe('paginate', () => {
    it('keeps a short menu on one page', () => {
        const pages = paginate([section('PATOS', 4), section('BEBIDAS', 3)], 'Incluye arroz', measure)
        expect(pages).toHaveLength(1)
        expect(pages[0].blocks.filter((block) => block.kind === 'note')).toHaveLength(1)
    })

    it('adds pages when the menu does not fit and repeats the section title', () => {
        const pages = paginate([section('PATOS', 40)], null, measure)
        expect(pages.length).toBeGreaterThan(1)
        expect(pages[1].blocks[0]).toMatchObject({ kind: 'section', name: 'PATOS' })
    })

    it('never leaves a section title alone at the bottom of a page', () => {
        const pages = paginate([section('A', 17), section('B', 5)], null, measure)
        for (const page of pages) {
            const last = page.blocks[page.blocks.length - 1]
            expect(last.kind).not.toBe('section')
        }
    })

    it('keeps every block inside the body area', () => {
        const pages = paginate([section('A', 30), section('B', 30)], 'Nota larga '.repeat(12), measure)
        for (const page of pages) {
            for (const block of page.blocks) {
                if (block.kind === 'item') expect(block.y + block.height).toBeLessThanOrEqual(GEOMETRY.bodyBottom)
            }
        }
    })

    it('puts the note on its own page when the last page is full', () => {
        const pages = paginate([section('A', 21)], 'Nota '.repeat(40), measure)
        const withNote = pages.filter((page) => page.blocks.some((block) => block.kind === 'note'))
        expect(withNote).toHaveLength(1)
    })

    it('ignores empty sections', () => {
        expect(paginate([{ name: 'VACÍA', products: [] }], null, measure)).toHaveLength(0)
    })
})
