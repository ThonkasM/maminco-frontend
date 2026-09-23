'use client'
import { useState } from 'react'
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
    productName: string
    onConfirm: () => Promise<void>
    onCancel: () => void
    isLoading?: boolean
}

export function DeleteConfirmModal({
    isOpen,
    productName,
    onConfirm,
    onCancel,
    isLoading,
}: DeleteConfirmModalProps) {
    const [confirming, setConfirming] = useState(false)

    const handleConfirm = async () => {
        setConfirming(true)
        try {
            await onConfirm()
            onCancel()
        } finally {
            setConfirming(false)
        }
    }

    const loading = confirming || isLoading

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Desactivar producto</DialogTitle>
                    <DialogDescription>
                        ¿Seguro que deseas desactivar el producto{' '}
                        <strong className="text-foreground">{productName}</strong>?
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
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? 'Desactivando...' : 'Desactivar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
