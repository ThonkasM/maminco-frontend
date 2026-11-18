import type { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { Reveal } from './Reveal'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  className?: string
}) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      <p
        className={cn(
          'inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-primary-ink',
          align === 'center' && 'justify-center',
        )}
      >
        <span className="h-px w-6 bg-current opacity-60" aria-hidden="true" />
        {eyebrow}
      </p>
      <h2 className="mt-4 text-balance font-display text-4xl font-normal uppercase leading-[1.04] tracking-[0.005em] sm:text-5xl lg:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-pretty text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  )
}
