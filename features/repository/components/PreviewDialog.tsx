'use client'
import { useEffect, useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { getFileUrl, type RepositoryNode } from '../api'
import { fileKind, formatBytes } from '../lib'

interface PreviewDialogProps {
    node: RepositoryNode | null
    onClose: () => void
}

export function openDownload(id: string) {
    return getFileUrl(id, true).then((result) => {
        const link = document.createElement('a')
        link.href = result.url
        link.rel = 'noopener'
        document.body.appendChild(link)
        link.click()
        link.remove()
    })
}

export function PreviewDialog({ node, onClose }: PreviewDialogProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const kind = node ? fileKind(node.name, node.kind, node.mimeType) : 'other'

    useEffect(() => {
        if (!node) return undefined
        let cancelled = false
        setUrl(null)
        setError(null)
        getFileUrl(node.id, false)
            .then((result) => !cancelled && setUrl(result.url))
            .catch((err: unknown) => !cancelled && setError(getErrorMessage(err, 'No se pudo abrir el archivo.')))
        return () => {
            cancelled = true
        }
    }, [node])

    return (
        <Dialog open={Boolean(node)} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="flex h-[min(90vh,52rem)] max-w-4xl flex-col gap-3">
                <DialogHeader className="pr-8">
                    <DialogTitle className="truncate">{node?.name}</DialogTitle>
                    <DialogDescription>{node ? `${formatBytes(node.size)}${node.createdByName ? ` · subido por ${node.createdByName}` : ''}` : ''}</DialogDescription>
                </DialogHeader>
                <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-muted">
                    {error ? (
                        <p className="p-6 text-center text-sm text-danger">{error}</p>
                    ) : !url ? (
                        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Cargando" />
                    ) : kind === 'pdf' ? (
                        <iframe src={url} title={node?.name ?? 'Vista previa'} className="size-full bg-white" />
                    ) : kind === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={url} alt={node?.name ?? ''} className="max-h-full max-w-full object-contain" />
                    ) : null}
                </div>
                <div className="flex justify-end">
                    <Button
                        variant="secondary"
                        onClick={() => node && openDownload(node.id).catch((err: unknown) => toast.error(getErrorMessage(err, 'No se pudo descargar.')))}
                    >
                        <Download />
                        Descargar
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
