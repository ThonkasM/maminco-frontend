'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ConciergeBell, Layers, Rows3, Search } from 'lucide-react'
import { WoodBackground } from '@/components/marketing/WoodBackground'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { cn } from '@/lib/utils/cn'
import type { MenuProduct, PublicMenuData } from '../api'
import { ProductCard } from './ProductCard'
import { ProductModal } from './ProductModal'

function updatedLabel(iso: string): string {
    return new Date(iso).toLocaleString('es-BO', { weekday: 'long', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/La_Paz' })
}

export function PublicMenu({ menu }: { menu: PublicMenuData }) {
    const [search, setSearch] = useState('')
    const [active, setActive] = useState(menu.sections[0]?.id ?? '')
    const [selected, setSelected] = useState<{ product: MenuProduct; category: string } | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [view, setView] = useState<'all' | 'section'>('all')
    const refs = useRef<Record<string, HTMLElement | null>>({})
    const chips = useRef<HTMLDivElement>(null)
    const listRef = useRef<HTMLElement>(null)
    const barRef = useRef<HTMLDivElement>(null)

    /** Keeps the reader at the start of the list (just under the bar) instead of jumping to the top of the page. */
    const anchorToList = () => {
        requestAnimationFrame(() => {
            const list = listRef.current
            if (!list) return
            const top = list.getBoundingClientRect().top + window.scrollY - (barRef.current?.offsetHeight ?? 0)
            if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' })
        })
    }

    const matches = useMemo(() => {
        const term = search.trim().toLowerCase()
        if (!term) return menu.sections
        return menu.sections
            .map((section) => ({
                ...section,
                products: section.products.filter(
                    (product) => product.name.toLowerCase().includes(term) || (product.description ?? '').toLowerCase().includes(term),
                ),
            }))
            .filter((section) => section.products.length > 0)
    }, [menu.sections, search])

    const searching = search.trim().length > 0
    const current = matches.find((section) => section.id === active) ?? matches[0]
    const sections = view === 'section' && !searching && current ? [current] : matches

    useEffect(() => {
        if (view === 'section' && !searching) return undefined
        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
                if (visible[0]) setActive(visible[0].target.id.replace('section-', ''))
            },
            { rootMargin: '-120px 0px -65% 0px' },
        )
        Object.values(refs.current).forEach((node) => node && observer.observe(node))
        return () => observer.disconnect()
    }, [sections, view, searching])

    useEffect(() => {
        const node = chips.current?.querySelector<HTMLElement>(`[data-chip="${active}"]`)
        node?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' })
    }, [active])

    const go = (id: string) => {
        if (view === 'section' && !searching) {
            setActive(id)
            anchorToList()
            return
        }
        refs.current[id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="border-b-[3px] border-brand-leaf bg-nav text-nav-foreground">
                <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-5 py-4">
                    <div className="flex items-center gap-4">
                        <Image src="/maminco-mark.png" alt="" width={512} height={389} className="h-11 w-auto shrink-0 sm:h-14" priority />
                        <div className="leading-none">
                            <Image src="/maminco-wordmark.png" alt={menu.restaurant} width={608} height={160} className="h-9 w-auto sm:h-11" priority />
                            <p className="mt-1.5 pl-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-cream/60 sm:text-[11px]">La tradición del pato</p>
                        </div>
                    </div>
                    <ThemeToggle className="text-nav-foreground hover:bg-nav-foreground/10 hover:text-nav-foreground" />
                </div>
            </header>

            <section className="dark relative isolate overflow-hidden border-b-4 border-brand-leaf bg-wood text-foreground">
                <WoodBackground className="absolute inset-0 -z-20" />
                <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/60 to-black/25" aria-hidden="true" />
                <div className="mx-auto grid max-w-4xl gap-8 px-5 py-14 sm:py-20 md:grid-cols-[minmax(0,1fr)_24rem] md:items-end md:gap-10">
                    <div>
                        <span className="inline-block rounded-full bg-[#0f0a08] px-5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-menu-green">
                            Nuestra carta
                        </span>
                        <h1 className="mt-5 font-display text-5xl font-normal uppercase leading-[1.02] tracking-[0.005em] text-cream sm:text-7xl">
                            Sabor de la <span className="text-menu-green">casa</span>
                        </h1>
                        <p className="mt-5 max-w-md text-base leading-relaxed text-cream/85">
                            Platos preparados al momento. Los precios están en bolivianos y lo que se agota no aparece en la carta.
                        </p>
                        <p suppressHydrationWarning className="mt-6 text-sm font-medium uppercase tracking-[0.16em] text-cream/75 sm:text-base">
                            Actualizada el {updatedLabel(menu.generatedAt)}
                        </p>
                    </div>
                    {menu.note && (
                        <aside
                            className="menu-note-in flex items-start gap-3.5 rounded-2xl border-2 border-transparent p-4 shadow-xl"
                            style={{
                                background:
                                    'linear-gradient(#191919, #191919) padding-box, linear-gradient(135deg, var(--color-brand-yellow), var(--color-brand-orange)) border-box',
                            }}
                        >
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-yellow to-brand-orange text-brand-charcoal">
                                <ConciergeBell className="size-5" aria-hidden="true" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-yellow">De la casa</p>
                                <p className="mt-1 text-[15px] font-medium leading-relaxed text-cream [font-family:var(--font-josefin),system-ui,sans-serif]">
                                    {menu.note}
                                </p>
                            </div>
                        </aside>
                    )}
                </div>
            </section>

            <div ref={barRef} className="sticky top-0 z-20 border-b-2 border-brand-leaf bg-nav text-cream shadow-lg">
                <div className="mx-auto max-w-4xl space-y-3 px-5 py-4">
                    <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-cream/70" aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Buscar en la carta…"
                            aria-label="Buscar en la carta"
                            className="h-11 w-full rounded-full border border-[#3a3631] bg-[#262320] pl-10 pr-4 text-sm text-cream placeholder:text-cream/60 focus-visible:border-brand-yellow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow/40"
                        />
                    </div>
                    <div className="flex shrink-0 rounded-full border border-[#3a3631] bg-[#262320] p-1" role="group" aria-label="Vista de la carta">
                        {(
                            [
                                ['all', 'Completa', Rows3],
                                ['section', 'Por sección', Layers],
                            ] as const
                        ).map(([id, label, Icon]) => (
                            <button
                                key={id}
                                type="button"
                                aria-pressed={view === id}
                                aria-label={`Vista ${label.toLowerCase()}`}
                                title={`Vista ${label.toLowerCase()}`}
                                onClick={() => {
                                    setView(id)
                                    anchorToList()
                                }}
                                className={cn(
                                    'flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors',
                                    view === id ? 'bg-cream text-brand-charcoal' : 'text-cream/80 hover:text-cream',
                                )}
                            >
                                <Icon className="size-4" aria-hidden="true" />
                                <span className="hidden sm:inline">{label}</span>
                            </button>
                        ))}
                    </div>
                    </div>
                    {view === 'section' && (
                    <nav ref={chips} aria-label="Secciones de la carta" className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
                        {matches.map((section) => (
                            <button
                                key={section.id}
                                type="button"
                                data-chip={section.id}
                                onClick={() => go(section.id)}
                                aria-current={current?.id === section.id ? 'true' : undefined}
                                className={cn(
                                    'shrink-0 rounded-full border px-4 py-1.5 text-sm font-bold uppercase tracking-wide transition-colors',
                                    current?.id === section.id
                                        ? 'border-transparent bg-gradient-to-r from-brand-yellow to-brand-orange text-brand-charcoal shadow-md'
                                        : 'border-[#3a3631] bg-[#262320] text-cream hover:bg-[#35302b]',
                                )}
                            >
                                {section.name}
                            </button>
                        ))}
                    </nav>
                    )}
                </div>
            </div>

            <main ref={listRef} className="mx-auto max-w-4xl space-y-12 px-5 py-10">

                {sections.length === 0 ? (
                    <p className="py-16 text-center text-muted-foreground">No encontramos platos con “{search}”.</p>
                ) : (
                    sections.map((section) => (
                        <section
                            key={section.id}
                            id={`section-${section.id}`}
                            ref={(node) => {
                                refs.current[section.id] = node
                            }}
                            className="scroll-mt-32"
                        >
                            <div className="mb-5 flex items-end gap-4">
                                <h2 className="font-display text-4xl uppercase leading-none tracking-wide text-foreground">{section.name}</h2>
                                <span className="mb-1 h-px flex-1 bg-border" aria-hidden="true" />
                                <span className="mb-1 text-xs text-muted-foreground">{section.products.length} opciones</span>
                            </div>
                            {section.description && <p className="-mt-2 mb-5 text-sm text-muted-foreground">{section.description}</p>}
                            <ul className={cn('grid gap-3', view === 'section' && !searching ? 'grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-2')}>
                                {section.products.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        layout={view === 'section' && !searching ? 'tile' : 'row'}
                                        onOpen={(item) => {
                                            setSelected({ product: item, category: section.name })
                                            setModalOpen(true)
                                        }}
                                    />
                                ))}
                            </ul>
                        </section>
                    ))
                )}
            </main>

            <ProductModal product={selected?.product ?? null} open={modalOpen} category={selected?.category} onClose={() => setModalOpen(false)} />

            <footer className="border-t border-border bg-surface-muted/50">
                <p className="mx-auto max-w-4xl px-5 py-6 text-center text-xs text-muted-foreground">
                    Precios en bolivianos (Bs.). La disponibilidad puede cambiar durante el día.
                </p>
            </footer>
        </div>
    )
}
