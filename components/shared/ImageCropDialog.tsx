'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'

const VIEW = 300
const MAX_OUTPUT = 1200
const MAX_ZOOM = 4

interface ImageCropDialogProps {
    file: File | null
    onCancel: () => void
    onConfirm: (cropped: File) => void
}

interface Offset {
    x: number
    y: number
}

/** Square crop with a circular guide: what stays inside the circle is what customers will see. */
export function ImageCropDialog({ file, onCancel, onConfirm }: ImageCropDialogProps) {
    const [url, setUrl] = useState<string | null>(null)
    const [natural, setNatural] = useState<{ w: number; h: number } | null>(null)
    const [zoom, setZoom] = useState(1)
    const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 })
    const [saving, setSaving] = useState(false)
    const drag = useRef<{ pointer: number; startX: number; startY: number; origin: Offset } | null>(null)
    const stage = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!file) return undefined
        const objectUrl = URL.createObjectURL(file)
        setUrl(objectUrl)
        setNatural(null)
        setZoom(1)
        setOffset({ x: 0, y: 0 })
        const image = new Image()
        image.onload = () => setNatural({ w: image.naturalWidth, h: image.naturalHeight })
        image.src = objectUrl
        return () => URL.revokeObjectURL(objectUrl)
    }, [file])

    const baseScale = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1
    const scale = baseScale * zoom

    const clamp = useCallback(
        (next: Offset, currentScale: number): Offset => {
            if (!natural) return next
            const maxX = Math.max(0, (natural.w * currentScale - VIEW) / 2)
            const maxY = Math.max(0, (natural.h * currentScale - VIEW) / 2)
            return { x: Math.min(maxX, Math.max(-maxX, next.x)), y: Math.min(maxY, Math.max(-maxY, next.y)) }
        },
        [natural],
    )

    const changeZoom = useCallback(
        (value: number) => {
            const next = Math.min(MAX_ZOOM, Math.max(1, value))
            setZoom(next)
            setOffset((current) => clamp(current, baseScale * next))
        },
        [baseScale, clamp],
    )

    useEffect(() => {
        const node = stage.current
        if (!node) return undefined
        const onWheel = (event: WheelEvent) => {
            event.preventDefault()
            changeZoom(zoom - event.deltaY * 0.002)
        }
        node.addEventListener('wheel', onWheel, { passive: false })
        return () => node.removeEventListener('wheel', onWheel)
    }, [changeZoom, zoom, natural])

    const onPointerDown = (event: React.PointerEvent) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, origin: offset }
    }
    const onPointerMove = (event: React.PointerEvent) => {
        const state = drag.current
        if (!state || state.pointer !== event.pointerId) return
        setOffset(clamp({ x: state.origin.x + event.clientX - state.startX, y: state.origin.y + event.clientY - state.startY }, scale))
    }
    const onPointerUp = () => {
        drag.current = null
    }

    const onKeyDown = (event: React.KeyboardEvent) => {
        const step = 12
        const moves: Record<string, Offset> = {
            ArrowLeft: { x: step, y: 0 },
            ArrowRight: { x: -step, y: 0 },
            ArrowUp: { x: 0, y: step },
            ArrowDown: { x: 0, y: -step },
        }
        const move = moves[event.key]
        if (!move) return
        event.preventDefault()
        setOffset((current) => clamp({ x: current.x + move.x, y: current.y + move.y }, scale))
    }

    const confirm = async () => {
        if (!natural || !url || !file) return
        setSaving(true)
        try {
            const image = await new Promise<HTMLImageElement>((resolve, reject) => {
                const el = new Image()
                el.onload = () => resolve(el)
                el.onerror = reject
                el.src = url
            })
            const size = VIEW / scale
            const sx = (natural.w * scale) / 2 / scale - VIEW / 2 / scale - offset.x / scale
            const sy = (natural.h * scale) / 2 / scale - VIEW / 2 / scale - offset.y / scale
            const output = Math.min(MAX_OUTPUT, Math.round(size))
            const canvas = document.createElement('canvas')
            canvas.width = output
            canvas.height = output
            const context = canvas.getContext('2d')
            if (!context) throw new Error('canvas')
            context.drawImage(image, sx, sy, size, size, 0, 0, output, output)
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.88))
            if (!blob) throw new Error('blob')
            onConfirm(new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' }))
        } finally {
            setSaving(false)
        }
    }

    const imageStyle = (k: number, size: number): React.CSSProperties =>
        natural
            ? {
                  position: 'absolute',
                  width: natural.w * scale * k,
                  height: natural.h * scale * k,
                  left: size / 2 - (natural.w * scale * k) / 2 + offset.x * k,
                  top: size / 2 - (natural.h * scale * k) / 2 + offset.y * k,
                  maxWidth: 'none',
                  userSelect: 'none',
              }
            : { display: 'none' }

    return (
        <Dialog open={Boolean(file)} onOpenChange={(open) => !open && !saving && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Ajusta la foto</DialogTitle>
                    <DialogDescription>
                        Lo que queda dentro del círculo es lo que verán tus clientes. Arrastra para mover y usa el control para acercar.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex justify-center">
                    <div
                        ref={stage}
                        tabIndex={0}
                        role="application"
                        aria-label="Área de recorte: arrastra o usa las flechas para mover la foto"
                        onKeyDown={onKeyDown}
                        onPointerDown={onPointerDown}
                        onPointerMove={onPointerMove}
                        onPointerUp={onPointerUp}
                        onPointerCancel={onPointerUp}
                        className="relative cursor-grab touch-none overflow-hidden rounded-xl bg-[#121212] active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ width: VIEW, height: VIEW }}
                    >
                        {url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={url} alt="" draggable={false} style={imageStyle(1, VIEW)} />
                        )}
                        <div
                            className="pointer-events-none absolute inset-0"
                            style={{ background: `radial-gradient(circle at center, transparent ${VIEW / 2 - 2}px, rgba(0,0,0,0.62) ${VIEW / 2 - 1}px)` }}
                            aria-hidden="true"
                        />
                        <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-brand-leaf" aria-hidden="true" />
                    </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                    <Button type="button" size="sm" variant="ghost" aria-label="Alejar" onClick={() => changeZoom(zoom - 0.25)}>
                        <Minus />
                    </Button>
                    <input
                        type="range"
                        min={1}
                        max={MAX_ZOOM}
                        step={0.01}
                        value={zoom}
                        onChange={(event) => changeZoom(Number(event.target.value))}
                        aria-label="Zoom"
                        className="flex-1 accent-[var(--primary)]"
                    />
                    <Button type="button" size="sm" variant="ghost" aria-label="Acercar" onClick={() => changeZoom(zoom + 0.25)}>
                        <Plus />
                    </Button>
                </div>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span>Así se verá:</span>
                    {[68, 40].map((size) => (
                        <span key={size} className="relative inline-block overflow-hidden rounded-full border-2 border-[#4a453e] bg-[#1c1a17]" style={{ width: size, height: size }}>
                            {url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={url} alt="" draggable={false} style={imageStyle(size / VIEW, size)} />
                            )}
                        </span>
                    ))}
                </div>

                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel} disabled={saving}>
                        Cancelar
                    </Button>
                    <Button onClick={() => void confirm()} disabled={!natural || saving}>
                        {saving ? 'Procesando…' : 'Usar esta foto'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
