'use client'
import { useMemo, useState } from 'react'
import { Check, Copy, Download, ExternalLink, Eye, Search } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, EmptyState, Input, Skeleton, Switch, Textarea } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils/cn'
import { formatCurrency } from '@/lib/utils/currency'
import { useAdminMenu, useSetAvailability, useUpdateNote } from '../hooks'
import { MenuExportDialog } from './MenuExportDialog'

/** Printed menus read better in title case, but names typed in capitals are left alone elsewhere. */
function titleCase(name: string): string {
    if (name !== name.toUpperCase()) return name
    return name
        .toLowerCase()
        .replace(/(^|[\s(])(\p{L})/gu, (_, lead: string, letter: string) => lead + letter.toUpperCase())
}

type Filter = 'all' | 'available' | 'unavailable'

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'Todos' },
    { id: 'available', label: 'Disponibles' },
    { id: 'unavailable', label: 'Agotados' },
]

export function MenuManagerPage() {
    const menu = useAdminMenu()
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState<Filter>('all')
    const [previewKey, setPreviewKey] = useState(0)
    const [copied, setCopied] = useState(false)
    const save = useSetAvailability(() => setPreviewKey((value) => value + 1))
    const saveNote = useUpdateNote(() => setPreviewKey((value) => value + 1))
    const [note, setNote] = useState<string | null>(null)
    const [exportOpen, setExportOpen] = useState(false)
    const savedNote = menu.data?.note ?? ''
    const noteValue = note ?? savedNote

    const storySections = useMemo(
        () =>
            (menu.data?.sections ?? [])
                .map((section) => ({
                    name: section.name,
                    products: section.products.filter((product) => product.isAvailable).map((product) => ({ name: titleCase(product.name), price: product.price })),
                }))
                .filter((section) => section.products.length > 0),
        [menu.data],
    )

    const sections = useMemo(() => {
        const term = search.trim().toLowerCase()
        return (menu.data?.sections ?? [])
            .map((section) => ({
                ...section,
                visible: section.products.filter(
                    (product) =>
                        (filter === 'all' || (filter === 'available' ? product.isAvailable : !product.isAvailable)) &&
                        (!term || product.name.toLowerCase().includes(term) || (product.description ?? '').toLowerCase().includes(term)),
                ),
            }))
            .filter((section) => section.visible.length > 0)
    }, [menu.data, search, filter])

    const totals = menu.data?.totals

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(`${window.location.origin}/menu`)
            setCopied(true)
            toast.success('Pega el enlace en WhatsApp, redes o un código QR.', 'Enlace copiado')
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('No se pudo copiar. Ábrelo y copia la dirección del navegador.')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Menú</h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Elige qué productos están disponibles hoy. El POS y el menú público se actualizan al instante y tu equipo recibe un aviso.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <a href="/menu" target="_blank" rel="noopener noreferrer" className="inline-flex">
                        <Button variant="primary" tabIndex={-1}>
                            <ExternalLink />
                            Ver enlace público
                        </Button>
                    </a>
                    <Button variant="secondary" onClick={() => void copyLink()}>
                        {copied ? <Check /> : <Copy />}
                        Copiar enlace
                    </Button>
                    <Button variant="secondary" onClick={() => setExportOpen(true)} disabled={menu.isLoading}>
                        <Download />
                        Exportar para historias
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <div className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mensaje de la carta</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Aparece arriba de los platos en la carta pública y en la versión para historias. Déjalo vacío para ocultarlo.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Textarea
                                rows={3}
                                maxLength={300}
                                value={noteValue}
                                onChange={(event) => setNote(event.target.value)}
                                placeholder="Ej.: Todos los platos vienen acompañados de arroz, yuca frita…"
                                aria-label="Mensaje de la carta"
                            />
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-xs text-muted-foreground">{noteValue.length}/300</span>
                                <Button
                                    size="sm"
                                    disabled={noteValue === savedNote || saveNote.isPending}
                                    onClick={() => saveNote.mutate(noteValue.trim() || null, { onSuccess: () => setNote(null) })}
                                >
                                    {saveNote.isPending ? 'Guardando…' : 'Guardar mensaje'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="flex flex-wrap items-center gap-3 p-4">
                            <div className="relative min-w-52 flex-1">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar producto…" className="pl-9" aria-label="Buscar producto" />
                            </div>
                            <div className="flex gap-1" role="group" aria-label="Filtro">
                                {FILTERS.map((item) => (
                                    <Button key={item.id} size="sm" variant={filter === item.id ? 'primary' : 'ghost'} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>
                                        {item.label}
                                    </Button>
                                ))}
                            </div>
                            {totals && (
                                <p className="text-sm text-muted-foreground">
                                    <span className="font-semibold text-foreground">{totals.available}</span> de {totals.products} disponibles
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    {menu.isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-40 w-full" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    ) : sections.length === 0 ? (
                        <EmptyState title="Sin productos" description="No hay productos que coincidan con la búsqueda." />
                    ) : (
                        sections.map((section) => {
                            const available = section.products.filter((product) => product.isAvailable).length
                            const allOn = available === section.products.length
                            return (
                                <Card key={section.id}>
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3">
                                        <div>
                                            <h3 className="font-display text-xl uppercase tracking-wide text-foreground">{section.name}</h3>
                                            <p className="text-xs text-muted-foreground">
                                                {available}/{section.products.length} disponibles
                                            </p>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            disabled={save.isPending}
                                            onClick={() => save.mutate({ productIds: section.products.map((product) => product.id), isAvailable: !allOn })}
                                        >
                                            {allOn ? 'Agotar todos' : 'Marcar todos disponibles'}
                                        </Button>
                                    </div>
                                    <ul className="divide-y divide-border">
                                        {section.visible.map((product) => (
                                            <li key={product.id} className="flex items-center gap-4 px-5 py-3">
                                                <div className="min-w-0 flex-1">
                                                    <p className={cn('truncate font-medium', product.isAvailable ? 'text-foreground' : 'text-muted-foreground line-through')}>
                                                        {product.name}
                                                    </p>
                                                    {product.description && <p className="truncate text-xs text-muted-foreground">{product.description}</p>}
                                                </div>
                                                <span className="tabular-nums text-sm text-muted-foreground">{formatCurrency(product.price)}</span>
                                                <span className={cn('w-20 text-right text-xs font-medium', product.isAvailable ? 'text-success' : 'text-danger')}>
                                                    {product.isAvailable ? 'Disponible' : 'Agotado'}
                                                </span>
                                                <Switch
                                                    checked={product.isAvailable}
                                                    aria-label={`${product.name} disponible`}
                                                    onCheckedChange={(isAvailable) => save.mutate({ productIds: [product.id], isAvailable })}
                                                />
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            )
                        })
                    )}
                </div>

                <aside className="hidden xl:block">
                    <div className="sticky top-24">
                        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Eye className="size-4" aria-hidden="true" />
                            Vista previa del menú público
                        </p>
                        <div className="overflow-hidden rounded-[2rem] border-[6px] border-brand-charcoal bg-brand-charcoal shadow-float">
                            <iframe key={previewKey} src="/menu?preview=1" title="Vista previa del menú público" className="h-[40rem] w-full bg-background" />
                        </div>
                    </div>
                </aside>
            </div>
            <MenuExportDialog open={exportOpen} onOpenChange={setExportOpen} sections={storySections} note={savedNote.trim() || null} />
        </div>
    )
}
