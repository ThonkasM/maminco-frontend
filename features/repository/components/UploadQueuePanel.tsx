'use client'
import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { uploadQueue, useUploadQueue, type UploadItem } from '../upload-queue'
import { formatBytes } from '../lib'

const STATUS_TEXT: Record<UploadItem['status'], string> = {
    queued: 'En espera',
    uploading: 'Subiendo',
    done: 'Listo',
    error: 'Falló',
    canceled: 'Cancelado',
}

function Row({ item }: { item: UploadItem }) {
    const percent = Math.round(item.progress * 100)
    const active = item.status === 'queued' || item.status === 'uploading'
    return (
        <li className="space-y-1.5 px-4 py-2.5">
            <div className="flex items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" title={item.name}>
                    {item.name}
                </p>
                {item.status === 'done' && <CheckCircle2 className="size-4 text-success" aria-label="Listo" />}
                {item.status === 'error' && <AlertTriangle className="size-4 text-danger" aria-label="Falló" />}
                {(item.status === 'error' || item.status === 'canceled') && (
                    <button type="button" onClick={() => uploadQueue.retry(item.id)} aria-label={`Reintentar ${item.name}`} className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <RotateCcw className="size-4" />
                    </button>
                )}
                {active && (
                    <button type="button" onClick={() => uploadQueue.cancel(item.id)} aria-label={`Cancelar ${item.name}`} className="rounded p-1 text-muted-foreground hover:bg-surface-muted hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <X className="size-4" />
                    </button>
                )}
            </div>
            <div
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={item.status === 'done' ? 100 : percent}
                aria-label={`Progreso de ${item.name}`}
                className="h-1.5 overflow-hidden rounded-full bg-surface-muted"
            >
                <div
                    className={cn('h-full rounded-full transition-[width]', item.status === 'error' ? 'bg-danger-fill' : item.status === 'canceled' ? 'bg-muted-foreground' : 'bg-primary')}
                    style={{ width: `${item.status === 'done' ? 100 : percent}%` }}
                />
            </div>
            <p className={cn('text-xs', item.status === 'error' ? 'text-danger' : 'text-muted-foreground')}>
                {item.status === 'error' ? (item.error ?? STATUS_TEXT.error) : `${STATUS_TEXT[item.status]} · ${formatBytes(item.size)}${item.status === 'uploading' ? ` · ${percent} %` : ''}`}
            </p>
        </li>
    )
}

export function UploadQueuePanel({ raised }: { raised?: boolean }) {
    const items = useUploadQueue()
    const [collapsed, setCollapsed] = useState(false)
    if (items.length === 0) return null

    const active = items.filter((item) => item.status === 'queued' || item.status === 'uploading').length
    const failed = items.filter((item) => item.status === 'error').length
    const done = items.filter((item) => item.status === 'done').length
    const title = active > 0 ? `Subiendo ${done + 1} de ${items.length}` : failed > 0 ? `${failed} archivo${failed === 1 ? '' : 's'} no se subió` : `${done} archivo${done === 1 ? '' : 's'} subido${done === 1 ? '' : 's'}`

    return (
        <div
            role="region"
            aria-label="Subidas"
            className={cn('fixed right-4 z-40 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-float', raised ? 'bottom-24' : 'bottom-4')}
        >
            <div className="flex items-center gap-2 border-b border-border bg-surface-muted px-4 py-2.5">
                <p className="flex-1 text-sm font-semibold text-foreground" aria-live="polite">
                    {title}
                </p>
                {active > 0 && (
                    <button type="button" onClick={() => uploadQueue.cancelAll()} className="text-xs font-semibold text-danger hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        Cancelar todo
                    </button>
                )}
                <button type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expandir subidas' : 'Contraer subidas'} aria-expanded={!collapsed} className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {collapsed ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>
                {active === 0 && (
                    <button type="button" onClick={() => uploadQueue.clearFinished()} aria-label="Cerrar" className="rounded p-1 text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <X className="size-4" />
                    </button>
                )}
            </div>
            {!collapsed && <ul className="max-h-64 divide-y divide-border overflow-y-auto">{items.map((item) => <Row key={item.id} item={item} />)}</ul>}
        </div>
    )
}
