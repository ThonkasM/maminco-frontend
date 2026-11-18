'use client'
import { useEffect, useState } from 'react'
import { Download, FileImage, FileText, Loader2 } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils/cn'
import { getErrorMessage } from '@/lib/utils/errors'
import { downloadStory, renderStoryPages } from '../export/render'
import type { StorySection } from '../export/layout'

interface MenuExportDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    sections: StorySection[]
    note: string | null
}

export function MenuExportDialog({ open, onOpenChange, sections, note }: MenuExportDialogProps) {
    const [pages, setPages] = useState<HTMLCanvasElement[]>([])
    const [previews, setPreviews] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [busy, setBusy] = useState(false)
    const [format, setFormat] = useState<'png' | 'pdf'>('png')

    useEffect(() => {
        if (!open) return undefined
        let cancelled = false
        setLoading(true)
        renderStoryPages(sections, note)
            .then((canvases) => {
                if (cancelled) return
                setPages(canvases)
                setPreviews(canvases.map((canvas) => canvas.toDataURL('image/jpeg', 0.7)))
            })
            .catch((error: unknown) => toast.error(getErrorMessage(error, 'No se pudo preparar la vista previa.')))
            .finally(() => !cancelled && setLoading(false))
        return () => {
            cancelled = true
        }
    }, [open, sections, note])

    const download = async () => {
        setBusy(true)
        try {
            await downloadStory(pages, format)
            toast.success(
                pages.length > 1 ? `Se generaron ${pages.length} páginas listas para historias.` : 'Tu carta quedó lista para historias.',
                'Carta exportada',
            )
            onOpenChange(false)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo exportar la carta.'))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-4">
                <DialogHeader>
                    <DialogTitle>Exportar carta para historias</DialogTitle>
                    <DialogDescription>
                        Versión simplificada de la carta con el estilo del menú impreso, en formato vertical 9:16 (1080 × 1920 px). Si no cabe en una
                        página, se genera una más.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-surface-muted/50 p-4">
                    {loading ? (
                        <div className="flex h-64 items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="size-4 animate-spin" /> Preparando vista previa…
                        </div>
                    ) : previews.length === 0 ? (
                        <p className="py-12 text-center text-sm text-muted-foreground">No hay productos disponibles para exportar.</p>
                    ) : (
                        <ul className="flex flex-wrap justify-center gap-4">
                            {previews.map((src, index) => (
                                <li key={index} className="text-center">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={src} alt={`Página ${index + 1} de la carta`} className="h-[26rem] w-auto rounded-lg border border-border shadow-card" />
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                        Página {index + 1} de {previews.length}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <fieldset className="flex flex-wrap items-center gap-2">
                    <legend className="sr-only">Formato</legend>
                    {(
                        [
                            ['png', 'PNG', FileImage, pages.length > 1 ? `${pages.length} imágenes en un .zip` : 'Imagen lista para subir'],
                            ['pdf', 'PDF', FileText, pages.length > 1 ? `${pages.length} páginas en un solo archivo` : 'Una página 9:16'],
                        ] as const
                    ).map(([id, label, Icon, hint]) => (
                        <label
                            key={id}
                            className={cn(
                                'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-2 transition-colors focus-within:ring-2 focus-within:ring-ring',
                                format === id ? 'border-primary bg-primary/10' : 'border-border hover:bg-surface-muted',
                            )}
                        >
                            <input type="radio" name="story-format" className="sr-only" checked={format === id} onChange={() => setFormat(id)} />
                            <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
                            <span>
                                <span className="block text-sm font-semibold text-foreground">{label}</span>
                                <span className="block text-xs text-muted-foreground">{hint}</span>
                            </span>
                        </label>
                    ))}
                </fieldset>

                <DialogFooter>
                    <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
                        Cancelar
                    </Button>
                    <Button onClick={() => void download()} disabled={busy || loading || pages.length === 0}>
                        {busy ? <Loader2 className="animate-spin" /> : <Download />}
                        {busy ? 'Generando…' : 'Descargar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
