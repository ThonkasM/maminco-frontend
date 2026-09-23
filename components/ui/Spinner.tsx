import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {
  label?: string
}

export function Spinner({ className, label = 'Cargando', ...props }: SpinnerProps) {
  return (
    <span role="status" className={cn('inline-flex items-center', className)} {...props}>
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
