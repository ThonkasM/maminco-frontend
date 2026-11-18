import { API_BASE, apiFetch, getAuthToken } from '@/lib/http/client'

export type NodeKind = 'FOLDER' | 'FILE'

export interface RepositoryNode {
    id: string
    name: string
    kind: NodeKind
    system: boolean
    mimeType: string | null
    size: number | null
    createdByName: string | null
    createdAt: string
    updatedAt: string
    /** Present on search results and trash items when the backend provides it. */
    path?: string | string[] | null
    deletedAt?: string | null
}

export interface BreadcrumbItem {
    id: string
    name: string
}

export interface NodesResponse {
    parent: { id: string; name: string } | null
    breadcrumb: BreadcrumbItem[]
    items: RepositoryNode[]
}

export interface Usage {
    files: number
    bytes: number
}

export const getNodes = (parentId: string | null, signal?: AbortSignal) =>
    apiFetch<NodesResponse>('/api/repository/nodes', { query: { parentId: parentId ?? undefined }, signal })

export const createFolder = (body: { parentId: string | null; name: string }) =>
    apiFetch<RepositoryNode>('/api/repository/folders', { method: 'POST', body: { parentId: body.parentId ?? undefined, name: body.name } })

export function uploadFiles(parentId: string | null, files: File[]) {
    const body = new FormData()
    if (parentId) body.append('parentId', parentId)
    for (const file of files) body.append('files', file)
    return apiFetch<RepositoryNode[]>('/api/repository/files', { method: 'POST', body })
}

export const updateNode = (id: string, body: { name?: string; parentId?: string | null }) =>
    apiFetch<RepositoryNode>(`/api/repository/nodes/${id}`, { method: 'PATCH', body })

export const deleteNode = (id: string) => apiFetch<unknown>(`/api/repository/nodes/${id}`, { method: 'DELETE' })

export const getTrash = (signal?: AbortSignal) => apiFetch<RepositoryNode[] | { items: RepositoryNode[] }>('/api/repository/trash', { signal })

export const restoreNode = (id: string) => apiFetch<unknown>(`/api/repository/nodes/${id}/restore`, { method: 'POST' })

export const deleteNodePermanently = (id: string) => apiFetch<unknown>(`/api/repository/nodes/${id}/permanent`, { method: 'DELETE' })

export const searchNodes = (q: string, signal?: AbortSignal) =>
    apiFetch<RepositoryNode[] | { items: RepositoryNode[] }>('/api/repository/search', { query: { q }, signal })

export const getFileUrl = (id: string, download: boolean) =>
    apiFetch<{ url: string; expiresIn: number }>(`/api/repository/files/${id}/url`, { query: { download: download ? 1 : 0 } })

export const getUsage = (signal?: AbortSignal) => apiFetch<Usage>('/api/repository/usage', { signal })

export const asList = (value: RepositoryNode[] | { items: RepositoryNode[] }): RepositoryNode[] => (Array.isArray(value) ? value : value.items)

/** Uploads one file with real progress (fetch has no upload progress events). */
export function uploadFileWithProgress(parentId: string | null, file: File, onProgress: (fraction: number) => void, signal: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest()
        request.open('POST', new URL('/api/repository/files', API_BASE).toString())
        const token = getAuthToken()
        if (token) request.setRequestHeader('Authorization', `Bearer ${token}`)
        request.upload.onprogress = (event) => {
            if (event.lengthComputable) onProgress(event.loaded / event.total)
        }
        request.onload = () => {
            if (request.status >= 200 && request.status < 300) return resolve()
            let message = 'No se pudo subir el archivo.'
            try {
                const body = JSON.parse(request.responseText) as { message?: string | string[] }
                if (body.message) message = Array.isArray(body.message) ? body.message[0] : body.message
            } catch {
                // keep the generic message
            }
            reject(new Error(message))
        }
        request.onerror = () => reject(new Error('Sin conexión con el servidor.'))
        request.onabort = () => reject(new DOMException('Cancelado', 'AbortError'))
        signal.addEventListener('abort', () => request.abort(), { once: true })
        const body = new FormData()
        if (parentId) body.append('parentId', parentId)
        body.append('files', file)
        request.send(body)
    })
}
