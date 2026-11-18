'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Download, FolderInput, FolderOpen, FolderPlus, Home, Pencil, RotateCcw, Search, Trash2, Upload, X } from 'lucide-react'
import { Button, Card, CardContent, EmptyState, Input, Skeleton } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils/cn'
import { getErrorMessage } from '@/lib/utils/errors'
import { deleteNode, updateNode, type RepositoryNode } from '../api'
import { useCreateFolder, useDeleteNode, useDeletePermanently, useNodes, useRestoreNode, useSearch, useTrash, useUpdateNode, useUsage } from '../hooks'
import { UPLOAD_ACCEPT, bulkMessage, checkUploads, fileKind, isPreviewable, rangeBetween, sortItems, type BulkResult } from '../lib'
import { queryClientRef } from '../queryClientRef'
import { uploadQueue } from '../upload-queue'
import { useRepositoryView } from '../view-store'
import { ActionsMenu, type MenuAction } from './ActionsMenu'
import { ConfirmDialog } from './ConfirmDialog'
import { MoveDialog } from './MoveDialog'
import { NameDialog } from './NameDialog'
import { NodeSections, type ItemHandlers } from './NodeItems'
import { openDownload, PreviewDialog } from './PreviewDialog'
import { SelectionBar } from './SelectionBar'
import { StorageMeter } from './StorageMeter'
import { UploadQueuePanel } from './UploadQueuePanel'
import { SortMenu, ViewModeSwitch } from './ViewControls'

type View = 'files' | 'trash'

export function RepositoryPage() {
    const queryClient = useQueryClient()
    const { mode, sortKey, sortDirection, setMode, setSort } = useRepositoryView()
    const [view, setView] = useState<View>('files')
    const [parentId, setParentId] = useState<string | null>(null)
    const [searchInput, setSearchInput] = useState('')
    const [term, setTerm] = useState('')
    const [dragging, setDragging] = useState(false)
    const [newFolderOpen, setNewFolderOpen] = useState(false)
    const [renaming, setRenaming] = useState<RepositoryNode | null>(null)
    const [moving, setMoving] = useState<RepositoryNode[]>([])
    const [deleting, setDeleting] = useState<RepositoryNode[]>([])
    const [purging, setPurging] = useState<RepositoryNode | null>(null)
    const [previewing, setPreviewing] = useState<RepositoryNode | null>(null)
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [bulkBusy, setBulkBusy] = useState(false)
    const anchor = useRef<string | null>(null)
    const fileInput = useRef<HTMLInputElement>(null)
    const dragDepth = useRef(0)

    useEffect(() => {
        queryClientRef.current = queryClient
    }, [queryClient])

    useEffect(() => {
        const timer = window.setTimeout(() => setTerm(searchInput.trim()), 300)
        return () => window.clearTimeout(timer)
    }, [searchInput])

    const searching = view === 'files' && term.length >= 2
    const nodes = useNodes(parentId, view === 'files')
    const search = useSearch(searching ? term : '')
    const trash = useTrash(view === 'trash')
    const usage = useUsage()
    const createFolder = useCreateFolder()
    const update = useUpdateNode()
    const remove = useDeleteNode()
    const restore = useRestoreNode()
    const purge = useDeletePermanently()

    const breadcrumb = nodes.data?.breadcrumb ?? []
    const current = nodes.data?.parent ?? null

    const source = view === 'trash' ? (trash.data ?? []) : searching ? (search.data ?? []) : (nodes.data?.items ?? [])
    const folders = useMemo(() => sortItems(source.filter((node) => node.kind === 'FOLDER'), sortKey, sortDirection), [source, sortKey, sortDirection])
    const files = useMemo(() => sortItems(source.filter((node) => node.kind === 'FILE'), sortKey, sortDirection), [source, sortKey, sortDirection])
    const visible = useMemo(() => [...folders, ...files], [folders, files])
    const selectableIds = useMemo(() => visible.filter((node) => !node.system && view === 'files').map((node) => node.id), [visible, view])

    const loading = view === 'trash' ? trash.isLoading : searching ? search.isLoading : nodes.isLoading
    const error = view === 'trash' ? trash.error : searching ? search.error : nodes.error

    const clearSelection = useCallback(() => {
        setSelected(new Set())
        anchor.current = null
    }, [])

    useEffect(() => {
        clearSelection()
    }, [parentId, view, term, clearSelection])

    useEffect(() => {
        if (selected.size === 0) return undefined
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && !document.querySelector('[role=dialog]')) clearSelection()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [selected.size, clearSelection])

    const openFolder = useCallback((id: string | null) => {
        setParentId(id)
        setSearchInput('')
        setTerm('')
    }, [])

    const startUpload = useCallback(
        (list: File[]) => {
            if (list.length === 0) return
            const { accepted, rejected } = checkUploads(list, Number.POSITIVE_INFINITY)
            if (rejected.length > 0) {
                toast.error(rejected.map((item) => `${item.name}: ${item.reason}`).join(' · '), accepted.length ? 'Algunos archivos se omitieron' : 'No se pudo subir')
            }
            if (accepted.length > 0) uploadQueue.add(accepted, parentId)
        },
        [parentId],
    )

    const dragEnabled = view === 'files' && !searching
    const dragProps = dragEnabled
        ? {
              onDragEnter: (event: React.DragEvent) => {
                  if (!event.dataTransfer.types.includes('Files')) return
                  event.preventDefault()
                  dragDepth.current += 1
                  setDragging(true)
              },
              onDragOver: (event: React.DragEvent) => event.preventDefault(),
              onDragLeave: () => {
                  dragDepth.current = Math.max(0, dragDepth.current - 1)
                  if (dragDepth.current === 0) setDragging(false)
              },
              onDrop: (event: React.DragEvent) => {
                  event.preventDefault()
                  dragDepth.current = 0
                  setDragging(false)
                  startUpload(Array.from(event.dataTransfer.files))
              },
          }
        : {}

    const downloadNode = (node: RepositoryNode) => openDownload(node.id).catch((err: unknown) => toast.error(getErrorMessage(err, 'No se pudo descargar.')))

    const open = (node: RepositoryNode) => {
        if (view === 'trash') return
        if (node.kind === 'FOLDER') return openFolder(node.id)
        if (isPreviewable(fileKind(node.name, node.kind, node.mimeType))) setPreviewing(node)
        else void downloadNode(node)
    }

    const toggle = (node: RepositoryNode, event: { shiftKey?: boolean }) => {
        if (!selectableIds.includes(node.id)) return
        if (event.shiftKey && anchor.current) {
            const range = rangeBetween(selectableIds, anchor.current, node.id)
            setSelected((currentSet) => new Set([...currentSet, ...range]))
            return
        }
        anchor.current = node.id
        setSelected((currentSet) => {
            const next = new Set(currentSet)
            if (next.has(node.id)) next.delete(node.id)
            else next.add(node.id)
            return next
        })
    }

    const handlers: ItemHandlers = {
        selecting: selected.size > 0,
        isSelected: (id) => selected.has(id),
        selectable: (node) => view === 'files' && !node.system,
        onToggle: toggle,
        onLongPress: (node) => toggle(node, {}),
        onActivate: (node, event) => {
            const modifier = 'ctrlKey' in event && (event.ctrlKey || event.metaKey)
            if (view === 'files' && !node.system && (event.shiftKey || modifier || selected.size > 0)) return toggle(node, event)
            open(node)
        },
        actionsFor: (node) => {
            if (view === 'trash') {
                return [
                    { id: 'restore', label: 'Restaurar', icon: <RotateCcw />, onSelect: () => restore.mutate({ id: node.id, name: node.name }) },
                    { id: 'purge', label: 'Eliminar para siempre', icon: <Trash2 />, danger: true, onSelect: () => setPurging(node) },
                ] satisfies MenuAction[]
            }
            const list: MenuAction[] = []
            if (node.kind === 'FILE') list.push({ id: 'download', label: 'Descargar', icon: <Download />, onSelect: () => void downloadNode(node) })
            if (!node.system) {
                list.push(
                    { id: 'rename', label: 'Cambiar nombre', icon: <Pencil />, onSelect: () => setRenaming(node) },
                    { id: 'move', label: 'Mover a…', icon: <FolderInput />, onSelect: () => setMoving([node]) },
                    { id: 'delete', label: 'Eliminar', icon: <Trash2 />, danger: true, onSelect: () => setDeleting([node]) },
                )
            }
            return list
        },
    }

    const selectedNodes = visible.filter((node) => selected.has(node.id))

    const runBulk = async (list: RepositoryNode[], work: (node: RepositoryNode) => Promise<unknown>): Promise<BulkResult> => {
        setBulkBusy(true)
        const results = await Promise.allSettled(list.map((node) => work(node)))
        setBulkBusy(false)
        const failures = results.filter((item): item is PromiseRejectedResult => item.status === 'rejected')
        const summary: BulkResult = {
            done: results.length - failures.length,
            failed: failures.length,
            firstError: failures[0] ? getErrorMessage(failures[0].reason, '') || undefined : undefined,
        }
        await queryClient.invalidateQueries({ queryKey: ['repository'] })
        clearSelection()
        if (summary.failed === 0) toast.success(bulkMessage(summary))
        else toast.error(bulkMessage(summary), 'Algunas acciones fallaron')
        return summary
    }

    const confirmDelete = () => {
        const list = deleting
        if (list.length === 1 && selected.size === 0) {
            remove.mutate({ id: list[0].id, name: list[0].name }, { onSuccess: () => setDeleting([]) })
            return
        }
        void runBulk(list, (node) => deleteNode(node.id)).then(() => setDeleting([]))
    }

    const confirmMove = (targetId: string | null) => {
        const list = moving
        if (list.length === 1 && selected.size === 0) {
            update.mutate({ id: list[0].id, parentId: targetId, label: `«${list[0].name}» se movió.` }, { onSuccess: () => setMoving([]) })
            return
        }
        void runBulk(list, (node) => updateNode(node.id, { parentId: targetId })).then(() => setMoving([]))
    }

    const empty =
        view === 'trash' ? (
            <EmptyState icon={<Trash2 />} title="La papelera está vacía" description="Lo que elimines se guarda aquí unos días antes de borrarse para siempre." />
        ) : searching ? (
            <EmptyState icon={<Search />} title="Sin resultados" description={`No encontramos nada parecido a «${term}».`} />
        ) : (
            <EmptyState
                icon={<FolderOpen />}
                title="Esta carpeta está vacía"
                description="Arrastra archivos aquí o usa «Subir archivos». También puedes crear carpetas para ordenarlos."
                action={
                    <Button onClick={() => fileInput.current?.click()}>
                        <Upload />
                        Subir archivos
                    </Button>
                }
            />
        )

    return (
        <div className="space-y-6" {...dragProps}>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Repositorio</h2>
                    <p className="max-w-2xl text-sm text-muted-foreground">Documentos del negocio: los cierres de día se guardan solos por año, mes y día; lo demás lo organizas tú.</p>
                    {usage.data && <StorageMeter files={usage.data.files} bytes={usage.data.bytes} />}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button variant={view === 'trash' ? 'primary' : 'ghost'} onClick={() => setView((value) => (value === 'trash' ? 'files' : 'trash'))} aria-pressed={view === 'trash'}>
                        <Trash2 />
                        Papelera
                    </Button>
                    {view === 'files' && (
                        <>
                            <Button variant="secondary" onClick={() => setNewFolderOpen(true)}>
                                <FolderPlus />
                                Nueva carpeta
                            </Button>
                            <Button onClick={() => fileInput.current?.click()}>
                                <Upload />
                                Subir archivos
                            </Button>
                        </>
                    )}
                    <input
                        ref={fileInput}
                        type="file"
                        multiple
                        accept={UPLOAD_ACCEPT}
                        className="sr-only"
                        aria-label="Elegir archivos para subir"
                        onChange={(event) => {
                            startUpload(Array.from(event.target.files ?? []))
                            event.target.value = ''
                        }}
                    />
                </div>
            </div>

            <Card>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                    {view === 'files' ? (
                        <>
                            <nav aria-label="Ruta" className="flex min-w-0 flex-1 flex-wrap items-center gap-1 text-sm">
                                <button type="button" onClick={() => openFolder(null)} className={cn('inline-flex items-center gap-1.5 rounded px-1.5 py-1 font-medium hover:bg-surface-muted', !current && 'text-foreground')}>
                                    <Home className="size-4" aria-hidden="true" />
                                    Repositorio
                                </button>
                                {breadcrumb.map((item, index) => (
                                    <span key={item.id} className="inline-flex items-center gap-1">
                                        <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                                        <button
                                            type="button"
                                            onClick={() => openFolder(item.id)}
                                            aria-current={index === breadcrumb.length - 1 ? 'page' : undefined}
                                            className={cn('rounded px-1.5 py-1 hover:bg-surface-muted', index === breadcrumb.length - 1 ? 'font-semibold text-foreground' : 'text-muted-foreground')}
                                        >
                                            {item.name}
                                        </button>
                                    </span>
                                ))}
                            </nav>
                            <div className="relative w-full sm:w-60">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Buscar en todo el repositorio…" aria-label="Buscar archivos" className="pl-9 pr-9" />
                                {searchInput && (
                                    <button type="button" onClick={() => setSearchInput('')} aria-label="Limpiar búsqueda" className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground">
                                        <X className="size-4" />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <p className="min-w-0 flex-1 text-sm text-muted-foreground">Papelera: restaura lo que borraste por error o elimínalo para siempre.</p>
                    )}
                    <SortMenu sortKey={sortKey} direction={sortDirection} onChange={setSort} />
                    <ViewModeSwitch mode={mode} onChange={setMode} />
                </CardContent>
            </Card>

            <div className="relative">
                {dragging && (
                    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary bg-surface text-center shadow-float" role="status">
                        <Upload className="size-8 text-primary-ink" aria-hidden="true" />
                        <p className="font-semibold text-foreground">Suelta para subir a «{current?.name ?? 'Repositorio'}»</p>
                    </div>
                )}

                {error ? (
                    <EmptyState title="No se pudo cargar" description={getErrorMessage(error, 'Intenta de nuevo en unos segundos.')} />
                ) : loading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <Skeleton key={index} className="h-14 w-full" />
                        ))}
                    </div>
                ) : visible.length === 0 ? (
                    empty
                ) : (
                    <NodeSections folders={folders} files={files} mode={mode} handlers={handlers} trash={view === 'trash'} />
                )}
            </div>

            {selected.size > 0 && (
                <SelectionBar
                    count={selected.size}
                    total={selectableIds.length}
                    busy={bulkBusy}
                    onClear={clearSelection}
                    onSelectAll={() => setSelected(new Set(selectableIds))}
                    onMove={() => setMoving(selectedNodes)}
                    onDelete={() => setDeleting(selectedNodes)}
                />
            )}
            <UploadQueuePanel raised={selected.size > 0} />

            <NameDialog
                open={newFolderOpen}
                title="Nueva carpeta"
                description={`Se creará dentro de «${current?.name ?? 'Repositorio'}».`}
                submitLabel="Crear"
                loading={createFolder.isPending}
                onClose={() => setNewFolderOpen(false)}
                onSubmit={(name) => createFolder.mutate({ parentId, name }, { onSuccess: () => setNewFolderOpen(false) })}
            />
            <NameDialog
                open={Boolean(renaming)}
                title="Cambiar nombre"
                initialValue={renaming?.name}
                submitLabel="Guardar"
                loading={update.isPending}
                onClose={() => setRenaming(null)}
                onSubmit={(name) => renaming && update.mutate({ id: renaming.id, name, label: 'Nombre actualizado.' }, { onSuccess: () => setRenaming(null) })}
            />
            <MoveDialog nodes={moving} currentParentId={parentId} loading={update.isPending || bulkBusy} onClose={() => setMoving([])} onConfirm={confirmMove} />
            <ConfirmDialog
                open={deleting.length > 0}
                title={deleting.length > 1 ? `¿Eliminar ${deleting.length} elementos?` : '¿Eliminar?'}
                description={
                    deleting.length > 1
                        ? 'Pasarán a la papelera junto con su contenido. Podrás restaurarlos desde ahí.'
                        : `«${deleting[0]?.name}» pasará a la papelera${deleting[0]?.kind === 'FOLDER' ? ' junto con todo su contenido' : ''}. Podrás restaurarlo desde ahí.`
                }
                confirmLabel="Eliminar"
                danger
                loading={remove.isPending || bulkBusy}
                onClose={() => setDeleting([])}
                onConfirm={confirmDelete}
            />
            <ConfirmDialog
                open={Boolean(purging)}
                title="¿Eliminar para siempre?"
                description={`«${purging?.name}» se borrará definitivamente y no se podrá recuperar.`}
                confirmLabel="Eliminar para siempre"
                danger
                loading={purge.isPending}
                onClose={() => setPurging(null)}
                onConfirm={() => purging && purge.mutate({ id: purging.id, name: purging.name }, { onSuccess: () => setPurging(null) })}
            />
            <PreviewDialog node={previewing} onClose={() => setPreviewing(null)} />
        </div>
    )
}
