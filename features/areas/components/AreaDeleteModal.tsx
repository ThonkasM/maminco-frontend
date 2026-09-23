'use client'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import type { AreaResponse } from '../api'

interface AreaDeleteModalProps {
    open: boolean
    area: AreaResponse
    onConfirm: () => Promise<void> | void
    onCancel: () => void
    loading?: boolean
}

export function AreaDeleteModal({
    open,
    area,
    onConfirm,
    onCancel,
    loading = false,
}: AreaDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Desactivar área</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que deseas desactivar el área{' '}
                        <strong className="text-foreground">{area.name}</strong>? Esta
                        acción puede revertirse.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="secondary" onClick={onCancel} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={onConfirm} disabled={loading}>
                        {loading ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
