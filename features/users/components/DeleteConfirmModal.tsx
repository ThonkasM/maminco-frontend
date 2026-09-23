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

interface DeleteConfirmModalProps {
    isOpen: boolean
    userName: string
    onConfirm: () => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function DeleteConfirmModal({
    isOpen,
    userName,
    onConfirm,
    onCancel,
    isLoading,
}: DeleteConfirmModalProps) {
    const handleConfirm = async () => {
        await onConfirm()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Desactivar usuario</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que deseas desactivar a{' '}
                        <strong className="text-foreground">{userName}</strong>?
                        Esta acción puede revertirse.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
