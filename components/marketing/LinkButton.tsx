import type { ComponentProps } from 'react'
import Link from 'next/link'
import { buttonVariants, type Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

type LinkButtonProps = Pick<
  ComponentProps<typeof Button>,
  'variant' | 'size' | 'shape' | 'className' | 'children'
> &
  Omit<ComponentProps<typeof Link>, 'className' | 'children'>

export function LinkButton({
  variant,
  size,
  shape = 'pill',
  className,
  children,
  ...props
}: LinkButtonProps) {
  return (
    <Link className={cn(buttonVariants({ variant, size, shape }), className)} {...props}>
      {children}
    </Link>
  )
}
