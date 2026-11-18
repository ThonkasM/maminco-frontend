'use client'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel: string
    danger?: boolean
    loading?: boolean
    onConfirm: () => void
    onClose: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, danger, loading, onConfirm, onClose }: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && !loading && onClose()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Procesando…' : confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
