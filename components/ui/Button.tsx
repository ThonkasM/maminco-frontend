import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80',
        accent:
          'bg-accent text-accent-foreground hover:bg-accent/90 active:bg-accent/80',
        secondary:
          'border border-border bg-surface-muted text-foreground hover:bg-surface-muted/70',
        outline:
          'border border-border bg-transparent text-foreground hover:bg-surface-muted',
        ghost: 'bg-transparent text-foreground hover:bg-surface-muted',
        danger:
          'bg-danger-fill text-white hover:bg-danger-fill/90 active:bg-danger-fill/80',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        icon: 'h-10 w-10',
      },
      shape: {
        squared: 'rounded-md',
        pill: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      shape: 'squared',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, shape, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, shape }), className)}
      {...props}
    />
  ),
)
Button.displayName = 'Button'

export { Button, buttonVariants }
