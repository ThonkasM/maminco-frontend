'use client'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { RepositoryNode } from '../api'
import { TILE_MIN, formatBytes, type ViewMode } from '../lib'
import { ActionsMenu, type MenuAction } from './ActionsMenu'
import { NodeVisual } from './NodeVisual'
import { useLongPress } from './useLongPress'

export interface ItemHandlers {
    selecting: boolean
    isSelected: (id: string) => boolean
    onActivate: (node: RepositoryNode, event: React.MouseEvent | React.KeyboardEvent) => void
    onToggle: (node: RepositoryNode, event: React.MouseEvent | React.KeyboardEvent) => void
    onLongPress: (node: RepositoryNode) => void
    actionsFor: (node: RepositoryNode) => MenuAction[]
    selectable: (node: RepositoryNode) => boolean
}

const dateFormat = (iso: string) => new Date(iso).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })

function pathOf(node: RepositoryNode): string | null {
    if (!node.path) return null
    return Array.isArray(node.path) ? node.path.join(' / ') : node.path
}

function Checkbox({ node, checked, selecting, onToggle, className }: { node: RepositoryNode; checked: boolean; selecting: boolean; onToggle: ItemHandlers['onToggle']; className?: string }) {
    return (
        <input
            type="checkbox"
            checked={checked}
            readOnly
            aria-label={`Seleccionar ${node.name}`}
            onClick={(event) => {
                event.stopPropagation()
                onToggle(node, event)
            }}
            onKeyDown={(event) => event.stopPropagation()}
            className={cn(
                'size-[18px] cursor-pointer accent-[var(--primary)] transition-opacity focus-visible:opacity-100',
                selecting || checked ? 'opacity-100' : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100',
                className,
            )}
        />
    )
}

function activateKey(event: React.KeyboardEvent, node: RepositoryNode, handlers: ItemHandlers, selectable: boolean) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter') {
        event.preventDefault()
        handlers.onActivate(node, event)
    } else if (event.key === ' ' && selectable) {
        event.preventDefault()
        handlers.onToggle(node, event)
    }
}

export function NodeTile({ node, mode, handlers }: { node: RepositoryNode; mode: Exclude<ViewMode, 'list'>; handlers: ItemHandlers }) {
    const selectable = handlers.selectable(node)
    const selected = handlers.isSelected(node.id)
    const press = useLongPress(() => handlers.onLongPress(node), selectable)
    const visual = mode === 'large' ? 96 : mode === 'medium' ? 64 : 40
    const actions = handlers.actionsFor(node)
    const isImage = node.kind === 'FILE' && (node.mimeType?.startsWith('image/') ?? false)

    return (
        <li
            role="button"
            tabIndex={0}
            aria-label={node.kind === 'FOLDER' ? `Abrir carpeta ${node.name}` : `Abrir ${node.name}`}
            aria-pressed={selectable ? selected : undefined}
            title={node.name}
            {...press.handlers}
            onClick={(event) => {
                if (press.consumed()) return
                handlers.onActivate(node, event)
            }}
            onKeyDown={(event) => activateKey(event, node, handlers, selectable)}
            className={cn(
                'group relative flex cursor-pointer select-none flex-col items-center rounded-xl border bg-surface text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-surface-muted',
                mode === 'large' ? 'gap-3 p-4' : mode === 'medium' ? 'gap-2 p-3' : 'gap-1.5 p-2',
            )}
            style={{ minWidth: 0 }}
        >
            {selectable && <Checkbox node={node} checked={selected} selecting={handlers.selecting} onToggle={handlers.onToggle} className="absolute left-2 top-2 z-10" />}
            {actions.length > 0 && !handlers.selecting && (
                <div className="absolute right-1 top-1 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
                    <ActionsMenu label={node.name} actions={actions} />
                </div>
            )}
            <div className={cn('flex w-full items-center justify-center', isImage && 'overflow-hidden rounded-lg')} style={{ height: visual + (isImage ? 24 : 0) }}>
                <NodeVisual node={node} size={visual} cover={isImage} className={isImage ? 'rounded-lg' : undefined} />
            </div>
            <div className="w-full min-w-0">
                <p className={cn('break-words font-medium text-foreground', mode === 'small' ? 'line-clamp-1 text-xs' : 'line-clamp-2 text-sm')}>{node.name}</p>
                {mode === 'large' && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{node.kind === 'FILE' ? formatBytes(node.size) : 'Carpeta'}</p>
                )}
            </div>
        </li>
    )
}

export function NodeRow({ node, handlers, trash }: { node: RepositoryNode; handlers: ItemHandlers; trash?: boolean }) {
    const selectable = handlers.selectable(node)
    const selected = handlers.isSelected(node.id)
    const press = useLongPress(() => handlers.onLongPress(node), selectable)
    const path = pathOf(node)
    const actions = handlers.actionsFor(node)

    return (
        <li
            role="button"
            tabIndex={0}
            aria-label={node.kind === 'FOLDER' ? `Abrir carpeta ${node.name}` : `Abrir ${node.name}`}
            aria-pressed={selectable ? selected : undefined}
            {...press.handlers}
            onClick={(event) => {
                if (press.consumed()) return
                handlers.onActivate(node, event)
            }}
            onKeyDown={(event) => activateKey(event, node, handlers, selectable)}
            className={cn(
                'group grid cursor-pointer select-none items-center gap-3 border-b border-border px-3 py-2 transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                'grid-cols-[1.25rem_minmax(0,1fr)_auto] md:grid-cols-[1.25rem_minmax(0,1fr)_6rem_10.5rem_9rem_auto]',
                selected ? 'bg-primary/10' : 'hover:bg-surface-muted',
            )}
        >
            <span className="flex size-5 items-center justify-center">
                {selectable ? <Checkbox node={node} checked={selected} selecting={handlers.selecting} onToggle={handlers.onToggle} /> : <Lock className="size-4 text-muted-foreground" aria-label="Protegido por el sistema" />}
            </span>
            <div className="flex min-w-0 items-center gap-3">
                <NodeVisual node={node} size={32} />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{node.name}</p>
                    <p className="truncate text-xs text-muted-foreground md:hidden">
                        {[node.kind === 'FILE' ? formatBytes(node.size) : 'Carpeta', dateFormat(node.deletedAt ?? node.updatedAt)].join(' · ')}
                    </p>
                    {path && <p className="truncate text-xs text-muted-foreground">{path}</p>}
                </div>
            </div>
            <span className="hidden text-right text-sm text-muted-foreground md:block">{node.kind === 'FOLDER' ? '—' : formatBytes(node.size)}</span>
            <span className="hidden whitespace-nowrap text-sm text-muted-foreground md:block">{dateFormat(node.deletedAt ?? node.updatedAt)}</span>
            <span className="hidden truncate text-sm text-muted-foreground md:block">{node.createdByName ?? (node.system ? 'Sistema' : '—')}</span>
            <div className="justify-self-end">{actions.length > 0 && <ActionsMenu label={node.name} actions={actions} />}</div>
            {trash && null}
        </li>
    )
}

export function ListHeader() {
    return (
        <div className="hidden grid-cols-[1.25rem_minmax(0,1fr)_6rem_10.5rem_9rem_auto] gap-3 border-b border-border bg-surface-muted/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid" aria-hidden="true">
            <span />
            <span>Nombre</span>
            <span className="text-right">Tamaño</span>
            <span>Modificado</span>
            <span>Subido por</span>
            <span className="w-9" />
        </div>
    )
}

interface SectionsProps {
    folders: RepositoryNode[]
    files: RepositoryNode[]
    mode: ViewMode
    handlers: ItemHandlers
    trash?: boolean
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
    return (
        <section aria-label={title} className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                {title}
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold tracking-normal">{count}</span>
            </h3>
            {children}
        </section>
    )
}

/** Carpetas and Archivos as two sections, as a compact list or as a responsive grid of tiles. */
export function NodeSections({ folders, files, mode, handlers, trash }: SectionsProps) {
    const render = (nodes: RepositoryNode[], showHeader: boolean) =>
        mode === 'list' ? (
            <ul className="overflow-hidden rounded-lg border border-border bg-surface">
                {showHeader && <ListHeader />}
                {nodes.map((node) => (
                    <NodeRow key={node.id} node={node} handlers={handlers} trash={trash} />
                ))}
            </ul>
        ) : (
            <ul className="grid gap-3" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${TILE_MIN[mode]}px, 1fr))` }}>
                {nodes.map((node) => (
                    <NodeTile key={node.id} node={node} mode={mode} handlers={handlers} />
                ))}
            </ul>
        )

    return (
        <div className="space-y-6">
            {folders.length > 0 && <Section title="Carpetas" count={folders.length}>{render(folders, true)}</Section>}
            {files.length > 0 && <Section title="Archivos" count={files.length}>{render(files, folders.length === 0)}</Section>}
        </div>
    )
}
