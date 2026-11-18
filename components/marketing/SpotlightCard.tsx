'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export function SpotlightCard({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ref = React.useRef<HTMLDivElement>(null)

  const handleMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    node.style.setProperty('--spot-x', `${event.clientX - rect.left}px`)
    node.style.setProperty('--spot-y', `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={cn(
        'group/spot relative overflow-hidden rounded-2xl border border-border bg-surface text-foreground shadow-card ring-1 ring-inset ring-black/[0.02] transition-[box-shadow,transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-elevated motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:ring-white/[0.03]',
        className,
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100"
        style={{
          background:
            'radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 50%), color-mix(in oklab, var(--primary) 10%, transparent), transparent 60%)',
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}
