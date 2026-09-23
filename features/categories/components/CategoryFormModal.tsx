'use client'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import type { CategoryResponse, CreateCategoryPayload } from '../api'
import { CategoryForm } from './CategoryForm'

interface CategoryFormModalProps {
    open: boolean
    category?: CategoryResponse
    existingNames: Set<string>
    onSubmit: (formData: CreateCategoryPayload) => Promise<void>
    onCancel: () => void
    submitting?: boolean
}

export function CategoryFormModal({
    open,
    category,
    existingNames,
    onSubmit,
    onCancel,
    submitting = false,
}: CategoryFormModalProps) {
    return (
        <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {category ? 'Editar categoría' : 'Nueva categoría'}
                    </DialogTitle>
                </DialogHeader>
                <CategoryForm
                    category={category}
                    existingNames={existingNames}
                    onSubmit={onSubmit}
                    onCancel={onCancel}
                    submitting={submitting}
                />
            </DialogContent>
        </Dialog>
    )
}
