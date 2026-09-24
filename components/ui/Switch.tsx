'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SwitchProps {
    checked: boolean
    onCheckedChange: (checked: boolean) => void
    disabled?: boolean
    id?: string
    'aria-label'?: string
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
    ({ checked, onCheckedChange, disabled, id, ...props }, ref) => (
        <button
            ref={ref}
            id={id}
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => onCheckedChange(!checked)}
            className={cn(
                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50',
                checked
                    ? 'border-primary bg-primary'
                    : 'border-border bg-surface-muted',
            )}
            {...props}
        >
            <span
                className={cn(
                    'inline-block size-4 rounded-full bg-white shadow transition-transform',
                    checked ? 'translate-x-6' : 'translate-x-1',
                )}
            />
        </button>
    ),
)
Switch.displayName = 'Switch'

export { Switch }
