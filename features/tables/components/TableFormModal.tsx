'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import type { TableResponse, CreateTablePayload } from '../api'
import type { AreaResponse } from '@/features/areas/api'
import { TableForm } from './TableForm'

interface TableFormModalProps {
    open: boolean
    table?: TableResponse
    areas: AreaResponse[]
    onSubmit: (formData: CreateTablePayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function TableFormModal({
    open,
    table,
    areas,
    onSubmit,
    onCancel,
    submitting = false,
}: TableFormModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {table ? 'Editar mesa' : 'Nueva mesa'}
                    </DialogTitle>
                </DialogHeader>
                <TableForm
                    table={table}
                    areas={areas}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    submitting={submitting}
                />
            </DialogContent>
        </Dialog>
    )
}
