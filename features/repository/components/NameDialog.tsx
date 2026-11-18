'use client'
import { useEffect, useState } from 'react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, FormField, Input } from '@/components/ui'
import { validateName } from '../lib'

interface NameDialogProps {
    open: boolean
    title: string
    description?: string
    initialValue?: string
    submitLabel: string
    loading?: boolean
    onSubmit: (name: string) => void
    onClose: () => void
}

export function NameDialog({ open, title, description, initialValue = '', submitLabel, loading, onSubmit, onClose }: NameDialogProps) {
    const [value, setValue] = useState(initialValue)
    const [touched, setTouched] = useState(false)

    useEffect(() => {
        if (open) {
            setValue(initialValue)
            setTouched(false)
        }
    }, [open, initialValue])

    const error = touched ? validateName(value) : null

    const submit = (event: React.FormEvent) => {
        event.preventDefault()
        setTouched(true)
        if (validateName(value)) return
        onSubmit(value.trim())
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !next && !loading && onClose()}>
            <DialogContent className="max-w-sm">
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && <DialogDescription>{description}</DialogDescription>}
                    </DialogHeader>
                    <FormField label="Nombre" error={error ?? undefined}>
                        <Input autoFocus value={value} maxLength={120} onChange={(event) => setValue(event.target.value)} onFocus={(event) => event.currentTarget.select()} />
                    </FormField>
                    <DialogFooter>
                        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Guardando…' : submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
