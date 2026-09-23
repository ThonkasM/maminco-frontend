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
import type { CategoryResponse } from '../api'

interface CategoryDeleteModalProps {
    open: boolean
    category: CategoryResponse
    onConfirm: () => Promise<void> | void
    onCancel: () => void
    loading?: boolean
}

export function CategoryDeleteModal({
    open,
    category,
    onConfirm,
    onCancel,
    loading = false,
}: CategoryDeleteModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Desactivar categoría</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que deseas desactivar la categoría{' '}
                        <strong className="text-foreground">{category.name}</strong>?
                        Esta acción puede revertirse.
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
