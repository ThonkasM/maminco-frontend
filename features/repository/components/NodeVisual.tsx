'use client'
import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getFileUrl, type RepositoryNode } from '../api'
import { fileKind } from '../lib'
import { NodeIcon } from './NodeIcon'

function useInView<T extends Element>() {
    const ref = useRef<T>(null)
    const [seen, setSeen] = useState(false)
    useEffect(() => {
        const node = ref.current
        if (!node || seen) return undefined
        if (typeof IntersectionObserver === 'undefined') {
            setSeen(true)
            return undefined
        }
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setSeen(true)
                    observer.disconnect()
                }
            },
            { rootMargin: '200px' },
        )
        observer.observe(node)
        return () => observer.disconnect()
    }, [seen])
    return [ref, seen] as const
}

interface NodeVisualProps {
    node: RepositoryNode
    /** Icon box size in px. */
    size: number
    /** Fill the whole tile (thumbnail covers it) instead of a rounded icon box. */
    cover?: boolean
    className?: string
}

/** Type icon, or a lazily loaded thumbnail for image files only. */
export function NodeVisual({ node, size, cover, className }: NodeVisualProps) {
    const kind = fileKind(node.name, node.kind, node.mimeType)
    const [ref, seen] = useInView<HTMLDivElement>()
    const [failed, setFailed] = useState(false)
    const wantsImage = kind === 'image' && !failed
    const url = useQuery({
        queryKey: ['repository', 'thumb', node.id, node.updatedAt],
        queryFn: () => getFileUrl(node.id, false),
        enabled: wantsImage && seen,
        staleTime: 4 * 60_000,
        retry: false,
    })

    return (
        <div ref={ref} className={cn('relative flex items-center justify-center overflow-hidden', cover ? 'size-full' : 'shrink-0 rounded-lg', className)} style={cover ? undefined : { width: size, height: size }}>
            {wantsImage && url.data ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={url.data.url} alt="" loading="lazy" decoding="async" onError={() => setFailed(true)} className="size-full object-cover" />
            ) : (
                <NodeIcon kind={kind} className="rounded-xl" size={Math.round(size * (cover ? 0.55 : 1))} />
            )}
            {node.system && (
                <span className="absolute bottom-1 right-1 flex size-5 items-center justify-center rounded-full bg-surface text-muted-foreground shadow-card" title="Protegido por el sistema">
                    <Lock className="size-3" aria-label="Protegido por el sistema" />
                </span>
            )}
        </div>
    )
}
