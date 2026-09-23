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
import type { TableResponse } from '../api'

interface TableDeleteModalProps {
    open: boolean
    table: TableResponse
    onConfirm: () => Promise<void> | void
    onCancel: () => void
    loading?: boolean
}

export function TableDeleteModal({
    open,
    table,
    onConfirm,
    onCancel,
    loading = false,
}: TableDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Desactivar mesa</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que deseas desactivar la mesa{' '}
                        <strong className="text-foreground">
                            #{table.number}
                        </strong>
                        ? Esta acción puede revertirse.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
