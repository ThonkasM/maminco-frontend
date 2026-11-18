'use client'
import { useEffect, useState } from 'react'
import { ChevronRight, Folder, Home } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { RepositoryNode } from '../api'
import { useNodes } from '../hooks'

interface MoveDialogProps {
    nodes: RepositoryNode[]
    /** Folder the node currently lives in (moving there would do nothing). */
    currentParentId: string | null
    loading?: boolean
    onConfirm: (targetId: string | null) => void
    onClose: () => void
}

/** Lazy folder picker: it only loads the folder you open. The moved folder (and so its subtree) cannot be entered. */
export function MoveDialog({ nodes: moving, currentParentId, loading, onConfirm, onClose }: MoveDialogProps) {
    const [folderId, setFolderId] = useState<string | null>(null)
    const open = moving.length > 0
    const nodes = useNodes(folderId, open)

    useEffect(() => {
        if (moving.length > 0) setFolderId(null)
    }, [moving])

    const folders = (nodes.data?.items ?? []).filter((item) => item.kind === 'FOLDER' && !item.system)
    const systemFolders = (nodes.data?.items ?? []).filter((item) => item.kind === 'FOLDER' && item.system)
    const breadcrumb = nodes.data?.breadcrumb ?? []
    const isSelf = (id: string) => moving.some((node) => node.id === id)
    const insideSelf = breadcrumb.some((item) => isSelf(item.id))
    const sameLocation = folderId === currentParentId
    const canMove = !insideSelf && !sameLocation

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !loading && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{moving.length === 1 ? `Mover «${moving[0].name}»` : `Mover ${moving.length} elementos`}</DialogTitle>
                    <DialogDescription>Abre la carpeta de destino y confirma. Las carpetas del sistema no admiten movimientos.</DialogDescription>
                </DialogHeader>

                <nav aria-label="Ubicación de destino" className="flex flex-wrap items-center gap-1 text-sm">
                    <button type="button" onClick={() => setFolderId(null)} className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-medium text-primary-ink hover:bg-surface-muted">
                        <Home className="size-3.5" /> Repositorio
                    </button>
                    {breadcrumb.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1">
                            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden="true" />
                            <button type="button" onClick={() => setFolderId(item.id)} className="rounded px-1.5 py-0.5 hover:bg-surface-muted">
                                {item.name}
                            </button>
                        </span>
                    ))}
                </nav>

                <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-lg border border-border">
                    {nodes.isLoading ? (
                        <li className="p-3">
                            <Skeleton className="h-5 w-2/3" />
                        </li>
                    ) : folders.length + systemFolders.length === 0 ? (
                        <li className="px-3 py-6 text-center text-sm text-muted-foreground">No hay subcarpetas aquí.</li>
                    ) : (
                        [...folders, ...systemFolders].map((folder) => {
                            const blocked = isSelf(folder.id) || folder.system
                            return (
                                <li key={folder.id}>
                                    <button
                                        type="button"
                                        disabled={blocked}
                                        onClick={() => setFolderId(folder.id)}
                                        className={cn('flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors', blocked ? 'cursor-not-allowed text-muted-foreground/60' : 'hover:bg-surface-muted')}
                                    >
                                        <Folder className="size-4 text-warning" aria-hidden="true" />
                                        <span className="flex-1 truncate">{folder.name}</span>
                                        {isSelf(folder.id) && <span className="text-xs">es la que mueves</span>}
                                        {folder.system && !isSelf(folder.id) && <span className="text-xs">sistema</span>}
                                    </button>
                                </li>
                            )
                        })
                    )}
                </ul>

                <p className="text-xs text-muted-foreground">
                    {sameLocation
                        ? 'Ya está en esta carpeta.'
                        : insideSelf
                          ? 'No puedes mover una carpeta dentro de sí misma.'
                          : `Destino: ${['Repositorio', ...breadcrumb.map((item) => item.name)].join(' / ')}`}
                </p>

                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button disabled={!canMove || loading} onClick={() => onConfirm(folderId)}>
                        {loading ? 'Moviendo…' : 'Mover aquí'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
