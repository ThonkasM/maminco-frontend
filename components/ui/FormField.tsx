'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'
import { Label } from './Label'

export interface FormFieldProps {
  label: string
  /** id used to link the label with the control. Auto-generated when omitted. */
  id?: string
  error?: string
  description?: string
  required?: boolean
  className?: string
  children: React.ReactElement<{
    id?: string
    'aria-invalid'?: boolean
    'aria-describedby'?: string
    'aria-errormessage'?: string
  }>
}

/**
 * Wires accessibility attributes (htmlFor/id, aria-invalid, aria-describedby)
 * around a single form control and renders its error with role="alert".
 */
export function FormField({
  label,
  id,
  error,
  description,
  required,
  className,
  children,
}: FormFieldProps) {
  const generatedId = React.useId()
  const fieldId = id ?? generatedId
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [descriptionId, errorId].filter(Boolean).join(' ') || undefined

  const control = React.cloneElement(children, {
    id: fieldId,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-errormessage': errorId,
  })

  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={fieldId}>
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5 text-danger">
            *
          </span>
        )}
      </Label>

      {control}

      {description && !error && (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}
