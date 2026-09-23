import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-surface-muted text-muted-foreground',
        info: 'border-primary/20 bg-primary/10 text-primary',
        success: 'border-success/25 bg-success/10 text-success',
        warning: 'border-warning/30 bg-warning/15 text-warning',
        danger: 'border-danger/25 bg-danger/10 text-danger',
        brand: 'border-accent/40 bg-accent/15 text-foreground',
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { badgeVariants }
