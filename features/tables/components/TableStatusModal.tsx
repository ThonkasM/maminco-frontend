'use client'

import { useResetOnChange } from '@/hooks/useResetOnChange'
import { useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Select,
} from '@/components/ui'
import type { TableResponse, TableStatus } from '../api'

interface TableStatusModalProps {
    open: boolean
    table: TableResponse
    onConfirm: (status: TableStatus) => Promise<void> | void
    onCancel: () => void
    loading?: boolean
}

export function TableStatusModal({
    open,
    table,
    onConfirm,
    onCancel,
    loading = false,
}: TableStatusModalProps) {
    const [newStatus, setNewStatus] = useState<TableStatus>(table.status)

    useResetOnChange(
        table,
        () => setNewStatus(table.status),
        () => true,
    )

    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Cambiar estado de mesa</DialogTitle>
                    <DialogDescription>
                        Mesa <strong className="text-foreground">#{table.number}</strong>
                    </DialogDescription>
                </DialogHeader>

                <FormField label="Nuevo estado">
                    <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value as TableStatus)}
                    >
                        <option value="AVAILABLE">Disponible</option>
                        <option value="OCCUPIED">Ocupada</option>
                        <option value="RESERVED">Reservada</option>
                    </Select>
                </FormField>

                <DialogFooter>
                    <Button
                        variant="secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => onConfirm(newStatus)}
                        disabled={loading}
                    >
                        {loading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
