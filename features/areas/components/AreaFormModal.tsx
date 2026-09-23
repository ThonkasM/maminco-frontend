'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import type { AreaResponse, CreateAreaPayload } from '../api'
import { AreaForm } from './AreaForm'

interface AreaFormModalProps {
    open: boolean
    area?: AreaResponse
    existingNames: Set<string>
    onSubmit: (formData: CreateAreaPayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function AreaFormModal({
    open,
    area,
    existingNames,
    onSubmit,
    onCancel,
    submitting = false,
}: AreaFormModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{area ? 'Editar área' : 'Nueva área'}</DialogTitle>
                </DialogHeader>
                <AreaForm
                    area={area}
                    existingNames={existingNames}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    submitting={submitting}
                />
            </DialogContent>
        </Dialog>
    )
}
