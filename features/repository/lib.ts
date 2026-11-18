export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024
export const MAX_FILES_PER_UPLOAD = 10

const ALLOWED_EXTENSIONS = new Set([
    'pdf',
    'doc',
    'docx',
    'xls',
    'xlsx',
    'ppt',
    'pptx',
    'csv',
    'txt',
    'png',
    'jpg',
    'jpeg',
    'webp',
    'gif',
    'zip',
])

export const UPLOAD_ACCEPT = Array.from(ALLOWED_EXTENSIONS)
    .map((extension) => `.${extension}`)
    .join(',')

export type FileKind = 'folder' | 'pdf' | 'image' | 'document' | 'sheet' | 'slides' | 'text' | 'archive' | 'other'

export function extensionOf(name: string): string {
    const dot = name.lastIndexOf('.')
    return dot > 0 ? name.slice(dot + 1).toLowerCase() : ''
}

export function formatBytes(bytes: number | null | undefined): string {
    if (bytes === null || bytes === undefined) return '—'
    if (bytes < 1024) return `${bytes} B`
    const units = ['KB', 'MB', 'GB', 'TB']
    let value = bytes / 1024
    let unit = 0
    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024
        unit++
    }
    return `${value.toLocaleString('es-BO', { maximumFractionDigits: value >= 100 ? 0 : 1 })} ${units[unit]}`
}

export function fileKind(name: string, kind: 'FOLDER' | 'FILE', mimeType?: string | null): FileKind {
    if (kind === 'FOLDER') return 'folder'
    const extension = extensionOf(name)
    if (extension === 'pdf' || mimeType === 'application/pdf') return 'pdf'
    if (['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension) || mimeType?.startsWith('image/')) return 'image'
    if (['doc', 'docx'].includes(extension)) return 'document'
    if (['xls', 'xlsx', 'csv'].includes(extension)) return 'sheet'
    if (['ppt', 'pptx'].includes(extension)) return 'slides'
    if (extension === 'txt') return 'text'
    if (extension === 'zip') return 'archive'
    return 'other'
}

export function isPreviewable(kind: FileKind): boolean {
    return kind === 'pdf' || kind === 'image'
}

export interface UploadCheck {
    accepted: File[]
    rejected: { name: string; reason: string }[]
}

/** Mirrors the backend rules so people get feedback before the upload starts. */
export function checkUploads(files: File[], limit = MAX_FILES_PER_UPLOAD): UploadCheck {
    const accepted: File[] = []
    const rejected: UploadCheck['rejected'] = []
    for (const file of files) {
        if (!ALLOWED_EXTENSIONS.has(extensionOf(file.name))) {
            rejected.push({ name: file.name, reason: 'tipo de archivo no permitido' })
        } else if (file.size === 0) {
            rejected.push({ name: file.name, reason: 'el archivo está vacío' })
        } else if (file.size > MAX_UPLOAD_BYTES) {
            rejected.push({ name: file.name, reason: `pesa más de ${formatBytes(MAX_UPLOAD_BYTES)}` })
        } else if (accepted.length >= limit) {
            rejected.push({ name: file.name, reason: `máximo ${limit} archivos por vez` })
        } else {
            accepted.push(file)
        }
    }
    return { accepted, rejected }
}

export function validateName(name: string): string | null {
    const trimmed = name.trim()
    if (!trimmed) return 'Escribe un nombre'
    if (trimmed.length > 120) return 'Máximo 120 caracteres'
    if (/[\\/:*?"<>|]/.test(trimmed)) return 'No uses \\ / : * ? " < > |'
    if (trimmed === '.' || trimmed === '..') return 'Nombre no válido'
    return null
}

export type ViewMode = 'list' | 'large' | 'medium' | 'small'
export type SortKey = 'name' | 'date' | 'size'
export type SortDirection = 'asc' | 'desc'

export const VIEW_MODES: ViewMode[] = ['list', 'large', 'medium', 'small']
export const SORT_KEYS: SortKey[] = ['name', 'date', 'size']

/** Minimum tile width (px) of the responsive grid in each icon mode. */
export const TILE_MIN: Record<Exclude<ViewMode, 'list'>, number> = { large: 180, medium: 128, small: 88 }

interface Sortable {
    name: string
    size: number | null
    updatedAt: string
    deletedAt?: string | null
}

/** Sorts one section (folders or files). Ties fall back to the name so the order is stable. */
export function sortItems<T extends Sortable>(items: T[], key: SortKey, direction: SortDirection): T[] {
    const factor = direction === 'asc' ? 1 : -1
    const byName = (a: T, b: T) => a.name.localeCompare(b.name, 'es', { numeric: true, sensitivity: 'base' })
    return [...items].sort((a, b) => {
        let result = 0
        if (key === 'date') result = new Date(a.deletedAt ?? a.updatedAt).getTime() - new Date(b.deletedAt ?? b.updatedAt).getTime()
        else if (key === 'size') result = (a.size ?? -1) - (b.size ?? -1)
        else result = byName(a, b)
        return result !== 0 ? result * factor : byName(a, b)
    })
}

/** Ids between `anchor` and `target` (inclusive) in the visible order; used by shift-click. */
export function rangeBetween(order: string[], anchor: string | null, target: string): string[] {
    const to = order.indexOf(target)
    if (to === -1) return []
    const from = anchor ? order.indexOf(anchor) : -1
    if (from === -1) return [target]
    const [start, end] = from < to ? [from, to] : [to, from]
    return order.slice(start, end + 1)
}

export interface BulkResult {
    done: number
    failed: number
    firstError?: string
}

export function bulkMessage(result: BulkResult): string {
    if (result.failed === 0) return `${result.done} hecha${result.done === 1 ? '' : 's'}`
    return `${result.done} hecha${result.done === 1 ? '' : 's'}, ${result.failed} fallaron${result.firstError ? `: ${result.firstError}` : ''}`
}
