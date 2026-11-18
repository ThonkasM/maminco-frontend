'use client'

import React, { useCallback, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'

interface ConfirmDialogProps {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    /** Kept for backwards compatibility; styling is handled by the Dialog. */
    confirmButtonClass?: string
}

export function useConfirmDialog() {
    const [open, setOpen] = useState(false)
    const [loading] = useState(false)
    const [config, setConfig] = useState<ConfirmDialogProps | null>(null)
    const [resolveFn, setResolveFn] = useState<((value: boolean) => void) | null>(
        null,
    )

    const showConfirmation = useCallback((next: ConfirmDialogProps) => {
        return new Promise<boolean>((resolve) => {
            setConfig(next)
            setResolveFn(() => resolve)
            setOpen(true)
        })
    }, [])

    const finish = (value: boolean) => {
        setOpen(false)
        resolveFn?.(value)
        setResolveFn(null)
    }

    const ConfirmDialogComponent = config ? (
        <Dialog open={open} onOpenChange={(next) => !next && finish(false)}>
            <DialogContent className="max-w-sm">
                <DialogHeader className="items-center text-center">
                    <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-danger/15 text-danger">
                        <AlertTriangle className="size-6" aria-hidden="true" />
                    </span>
                    <DialogTitle>{config.title}</DialogTitle>
                    <DialogDescription className="whitespace-pre-wrap">
                        {config.message}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center">
                    <Button
                        variant="secondary"
                        onClick={() => finish(false)}
                        disabled={loading}
                    >
                        {config.cancelText ?? 'Cancelar'}
                    </Button>
                    <Button
                        variant="danger"
                        onClick={() => finish(true)}
                        disabled={loading}
                    >
                        {config.confirmText ?? 'Confirmar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ) : null

    return { showConfirmation, ConfirmDialogComponent }
}
