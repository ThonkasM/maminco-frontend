import { describe, expect, it } from 'vitest'
import { MAX_UPLOAD_BYTES, bulkMessage, checkUploads, extensionOf, fileKind, formatBytes, rangeBetween, sortItems, validateName } from '@/features/repository/lib'

function sized(name: string, size: number): File {
    const f = new File(['x'], name)
    Object.defineProperty(f, 'size', { value: size })
    return f
}

const file = (name: string) => sized(name, 1000)


describe('formatBytes', () => {
    it('formats units', () => {
        expect(formatBytes(null)).toBe('—')
        expect(formatBytes(512)).toBe('512 B')
        expect(formatBytes(1536)).toContain('KB')
        expect(formatBytes(5 * 1024 * 1024)).toContain('MB')
    })
})

describe('fileKind', () => {
    it('classifies by extension and kind', () => {
        expect(fileKind('Cierre.pdf', 'FILE')).toBe('pdf')
        expect(fileKind('foto.JPG', 'FILE')).toBe('image')
        expect(fileKind('ventas.xlsx', 'FILE')).toBe('sheet')
        expect(fileKind('2026', 'FOLDER')).toBe('folder')
        expect(fileKind('algo.bin', 'FILE')).toBe('other')
    })
    it('reads extensions safely', () => {
        expect(extensionOf('archivo')).toBe('')
        expect(extensionOf('.oculto')).toBe('')
        expect(extensionOf('a.b.CSV')).toBe('csv')
    })
})

describe('checkUploads', () => {
    it('accepts allowed files and explains rejections', () => {
        const result = checkUploads([file('a.pdf'), sized('grande.pdf', MAX_UPLOAD_BYTES + 1), file('virus.exe'), sized('vacio.txt', 0)])
        expect(result.accepted.map((item) => item.name)).toEqual(['a.pdf'])
        expect(result.rejected.map((item) => item.name)).toEqual(['grande.pdf', 'virus.exe', 'vacio.txt'])
    })
    it('limits files per upload', () => {
        const files = Array.from({ length: 12 }, (_, index) => file(`f${index}.pdf`))
        const result = checkUploads(files)
        expect(result.accepted).toHaveLength(10)
        expect(result.rejected).toHaveLength(2)
    })
})

describe('validateName', () => {
    it('rejects empty, long and forbidden names', () => {
        expect(validateName('  ')).not.toBeNull()
        expect(validateName('a/b')).not.toBeNull()
        expect(validateName('x'.repeat(121))).not.toBeNull()
        expect(validateName('Cierres 2026')).toBeNull()
    })
})

describe('sortItems', () => {
    const items = [
        { name: 'b.pdf', size: 30, updatedAt: '2026-01-02T00:00:00Z' },
        { name: 'a.pdf', size: 10, updatedAt: '2026-01-03T00:00:00Z' },
        { name: 'c.pdf', size: null, updatedAt: '2026-01-01T00:00:00Z' },
    ]
    it('sorts by name, date and size in both directions', () => {
        expect(sortItems(items, 'name', 'asc').map((i) => i.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf'])
        expect(sortItems(items, 'date', 'desc').map((i) => i.name)).toEqual(['a.pdf', 'b.pdf', 'c.pdf'])
        expect(sortItems(items, 'size', 'desc').map((i) => i.name)).toEqual(['b.pdf', 'a.pdf', 'c.pdf'])
    })
    it('sorts names naturally and does not mutate the input', () => {
        const names = [{ name: 'f10', size: 1, updatedAt: '2026-01-01' }, { name: 'f2', size: 1, updatedAt: '2026-01-01' }]
        expect(sortItems(names, 'name', 'asc').map((i) => i.name)).toEqual(['f2', 'f10'])
        expect(names[0].name).toBe('f10')
    })
})

describe('rangeBetween', () => {
    const order = ['a', 'b', 'c', 'd', 'e']
    it('selects the inclusive range in either direction', () => {
        expect(rangeBetween(order, 'b', 'd')).toEqual(['b', 'c', 'd'])
        expect(rangeBetween(order, 'd', 'b')).toEqual(['b', 'c', 'd'])
    })
    it('falls back to the target when there is no valid anchor', () => {
        expect(rangeBetween(order, null, 'c')).toEqual(['c'])
        expect(rangeBetween(order, 'zz', 'c')).toEqual(['c'])
        expect(rangeBetween(order, 'a', 'zz')).toEqual([])
    })
})

describe('bulkMessage', () => {
    it('reports partial failures', () => {
        expect(bulkMessage({ done: 3, failed: 0 })).toBe('3 hechas')
        expect(bulkMessage({ done: 1, failed: 0 })).toBe('1 hecha')
        expect(bulkMessage({ done: 2, failed: 1, firstError: 'Ya existe' })).toBe('2 hechas, 1 fallaron: Ya existe')
    })
})
