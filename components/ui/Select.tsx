'use client'

import * as React from 'react'
import * as SelectPrimitive from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

/**
 * Designed select built on Radix.
 *
 * Supports both the new API (`onValueChange` + `<SelectItem>`) and the legacy
 * native API (`onChange` + `<option>`) so existing forms keep working unchanged.
 */
export interface SelectProps {
    value?: string
    onValueChange?: (value: string) => void
    /** Legacy handler; receives a synthetic event exposing `target.value`. */
    onChange?: (event: { target: { value: string } }) => void
    placeholder?: string
    disabled?: boolean
    name?: string
    className?: string
    id?: string
    'aria-invalid'?: boolean
    'aria-describedby'?: string
    'aria-errormessage'?: string
    children?: React.ReactNode
}

function isOptionElement(
    node: React.ReactNode,
): node is React.ReactElement<{ value?: string; children?: React.ReactNode }> {
    return React.isValidElement(node) && node.type === 'option'
}

const Select = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Trigger>,
    SelectProps
>(
    (
        {
            value,
            onValueChange,
            onChange,
            placeholder,
            disabled,
            className,
            id,
            children,
            'aria-describedby': ariaDescribedBy,
            'aria-errormessage': ariaErrorMessage,
        },
        ref,
    ) => {
        let legacyPlaceholder: React.ReactNode
        const items: React.ReactNode[] = []

        React.Children.forEach(children, (child) => {
            if (isOptionElement(child)) {
                const optionValue = String(child.props.value ?? '')
                if (optionValue === '') {
                    legacyPlaceholder = child.props.children
                    return
                }
                items.push(
                    <SelectPrimitive.Item
                        key={optionValue}
                        value={optionValue}
                        className="relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                    >
                        <span className="absolute left-2 flex size-4 items-center justify-center">
                            <SelectPrimitive.ItemIndicator>
                                <Check className="size-4 text-primary" />
                            </SelectPrimitive.ItemIndicator>
                        </span>
                        <SelectPrimitive.ItemText>
                            {child.props.children}
                        </SelectPrimitive.ItemText>
                    </SelectPrimitive.Item>,
                )
                return
            }
            items.push(child)
        })

        const handleValueChange = (next: string) => {
            onValueChange?.(next)
            onChange?.({ target: { value: next } })
        }

        return (
            <SelectPrimitive.Root
                value={value === '' ? undefined : value}
                onValueChange={handleValueChange}
                disabled={disabled}
            >
                <SelectPrimitive.Trigger
                    ref={ref}
                    id={id}
                    disabled={disabled}
                    aria-describedby={ariaDescribedBy}
                    aria-errormessage={ariaErrorMessage}
                    className={cn(
                        'flex h-10 w-full items-center justify-between gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-card transition-colors focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger data-[placeholder]:text-muted-foreground',
                        className,
                    )}
                >
                    <SelectPrimitive.Value
                        placeholder={placeholder ?? legacyPlaceholder}
                    />
                    <SelectPrimitive.Icon asChild>
                        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                    </SelectPrimitive.Icon>
                </SelectPrimitive.Trigger>
                <SelectPrimitive.Portal>
                    <SelectPrimitive.Content
                        position="popper"
                        sideOffset={4}
                        className="z-[110] max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-surface text-foreground shadow-float"
                    >
                        <SelectPrimitive.Viewport className="p-1">
                            {items}
                        </SelectPrimitive.Viewport>
                    </SelectPrimitive.Content>
                </SelectPrimitive.Portal>
            </SelectPrimitive.Root>
        )
    },
)
Select.displayName = 'Select'

const SelectItem = React.forwardRef<
    React.ComponentRef<typeof SelectPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
    <SelectPrimitive.Item
        ref={ref}
        className={cn(
            'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-surface-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
            className,
        )}
        {...props}
    >
        <span className="absolute left-2 flex size-4 items-center justify-center">
            <SelectPrimitive.ItemIndicator>
                <Check className="size-4 text-primary" />
            </SelectPrimitive.ItemIndicator>
        </span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
))
SelectItem.displayName = 'SelectItem'

const SelectGroup = SelectPrimitive.Group
const SelectLabel = SelectPrimitive.Label

export { Select, SelectItem, SelectGroup, SelectLabel }
