'use client'
import { useLayoutEffect, useRef, useState } from 'react'
import { ProductImage } from '@/components/shared/ProductImage'
import { cn } from '@/lib/utils/cn'
import type { MenuProduct } from '../api'
import { formatMenuPrice } from '../format'

interface ProductCardProps {
    product: MenuProduct
    layout: 'row' | 'tile'
    onOpen: (product: MenuProduct) => void
}

export function ProductCard({ product, layout, onOpen }: ProductCardProps) {
    const text = useRef<HTMLParagraphElement>(null)
    const [clamped, setClamped] = useState(false)

    useLayoutEffect(() => {
        const node = text.current
        if (!node) return undefined
        const measure = () => setClamped(node.scrollHeight > node.clientHeight + 1)
        measure()
        const observer = new ResizeObserver(measure)
        observer.observe(node)
        return () => observer.disconnect()
    }, [product.description, layout])

    const open = () => onOpen(product)
    const tile = layout === 'tile'

    return (
        <li
            role="button"
            tabIndex={0}
            aria-label={`Ver detalle de ${product.name}`}
            onClick={open}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    open()
                }
            }}
            className={cn(
                'flex cursor-pointer rounded-2xl border border-border bg-surface p-4 shadow-card transition-all hover:border-primary/50 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow active:scale-[0.99]',
                tile ? 'flex-col items-center gap-3 text-center' : 'items-center gap-4',
            )}
        >
            <ProductImage image={product.image} alt="" size={tile ? 120 : 68} />

            <div className={cn('min-w-0 flex-1', tile && 'w-full')}>
                <p className="text-[17px] font-bold leading-snug text-foreground">{product.name}</p>
                {product.description && (
                    <>
                        <p ref={text} className={cn('mt-1 text-[13px] leading-snug text-muted-foreground', tile ? 'line-clamp-3 min-h-[3.9em]' : 'line-clamp-2')}>
                            {product.description}
                        </p>
                        {clamped && <span className="mt-1.5 inline-block text-xs font-bold uppercase tracking-wide text-menu-green">Ver más</span>}
                    </>
                )}
            </div>

            <span className="shrink-0 rounded-full bg-brand-yellow px-3.5 py-1.5 text-base font-extrabold tabular-nums text-brand-charcoal">{formatMenuPrice(product.price)}</span>
        </li>
    )
}
