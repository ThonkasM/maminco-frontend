'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

interface ProductImageProps {
    image?: { thumb: string; large: string } | null
    alt: string
    /** `thumb` (320 px) for lists and cards, `large` (960 px) for the detail view. */
    variant?: 'thumb' | 'large'
    /** Rendered CSS size in px; also reserves the space to avoid layout shift. */
    size: number
    className?: string
    priority?: boolean
}

/** Round product photo. Without a photo (or if it fails to load) it shows the menu icon on charcoal. */
export function ProductImage({ image, alt, variant = 'thumb', size, className, priority }: ProductImageProps) {
    const [failed, setFailed] = useState(false)
    const showPhoto = Boolean(image) && !failed

    return (
        <span
            className={cn(
                'relative inline-flex shrink-0 overflow-hidden rounded-full border-2 bg-[#1c1a17]',
                showPhoto ? 'border-[#4a453e]' : 'border-brand-leaf',
                className,
            )}
            style={{ width: size, height: size }}
        >
            {showPhoto && image ? (
                // eslint-disable-next-line @next/next/no-img-element -- already WebP at the right size; skip the image optimizer
                <img
                    src={variant === 'large' ? image.large : image.thumb}
                    srcSet={`${image.thumb} 320w, ${image.large} 960w`}
                    sizes={`${size}px`}
                    alt={alt}
                    width={size}
                    height={size}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    onError={() => setFailed(true)}
                    className="size-full object-cover"
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src="/menu-fallback.png" alt="" aria-hidden="true" width={size} height={size} className="size-full object-contain p-[14%]" />
            )}
        </span>
    )
}
