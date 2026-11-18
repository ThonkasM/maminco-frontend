'use client'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { WoodBackground } from '@/components/marketing/WoodBackground'
import { ProductImage } from '@/components/shared/ProductImage'
import type { MenuProduct } from '../api'
import { formatMenuPrice } from '../format'

interface ProductModalProps {
    product: MenuProduct | null
    open: boolean
    category?: string
    onClose: () => void
}

/** Fixed-size detail card: photo and price stay put, only the description scrolls. */
export function ProductModal({ product, open, category, onClose }: ProductModalProps) {
    return (
        <DialogPrimitive.Root open={open} onOpenChange={(open) => !open && onClose()}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="menu-overlay fixed inset-0 z-40 bg-black/75" />
                <DialogPrimitive.Content
                    className="menu-modal dark fixed left-1/2 top-1/2 z-50 flex h-[min(34rem,86svh)] w-[min(26rem,92vw)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-3xl border border-[#3a3631] bg-[#1c1a17] text-cream shadow-2xl focus:outline-none"
                    aria-describedby={undefined}
                >
                    {product && (
                        <>
                            <div className="relative shrink-0 border-b-4 border-brand-leaf bg-wood px-6 pb-6 pt-8 text-center">
                                <WoodBackground className="absolute inset-0" />
                                <div className="absolute inset-0 bg-black/45" aria-hidden="true" />
                                <div className="relative flex justify-center">
                                    <ProductImage image={product.image} alt={product.name} size={152} variant="large" priority className="border-4 shadow-xl" />
                                </div>
                                <DialogPrimitive.Close
                                    aria-label="Cerrar"
                                    className="absolute right-3 top-3 z-10 inline-flex size-9 items-center justify-center rounded-full border border-[#4a453e] bg-[#1c1a17] text-cream transition-colors hover:bg-[#35302b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
                                >
                                    <X className="size-4" />
                                </DialogPrimitive.Close>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col px-6 pb-6 pt-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        {category && <p className="text-xs font-bold uppercase tracking-[0.2em] text-menu-green">{category}</p>}
                                        <DialogPrimitive.Title className="mt-1.5 font-display text-4xl uppercase leading-[0.95] tracking-wide text-cream">{product.name}</DialogPrimitive.Title>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-gradient-to-r from-brand-yellow to-brand-orange px-4 py-1.5 text-lg font-extrabold tabular-nums text-brand-charcoal shadow-md">
                                        {formatMenuPrice(product.price)}
                                    </span>
                                </div>
                                <p className="mt-5 border-t border-[#3a3631] pt-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-cream/45">Sobre este plato</p>
                                <div className="mt-2 min-h-0 flex-1 overflow-y-auto pr-1 text-[15px] leading-relaxed text-cream/80 [scrollbar-color:#4a453e_transparent] [scrollbar-width:thin]">
                                    {product.description ? (
                                        <p className="whitespace-pre-line">{product.description}</p>
                                    ) : (
                                        <p className="text-cream/50">Plato de la casa, preparado al momento.</p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    )
}
