'use client'
import { useEffect, useState } from 'react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    FormField,
    Input,
    Select,
    Textarea,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import type { ProductResponse } from '@/features/products/api'

interface AddItemModalProps {
    isOpen: boolean
    products: ProductResponse[]
    onSubmit: (
        productId: string,
        quantity: number,
        notes: string,
    ) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export function AddItemModal({
    isOpen,
    products,
    onSubmit,
    onClose,
    isLoading,
}: AddItemModalProps) {
    const [productId, setProductId] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (!isOpen) return
        setProductId('')
        setQuantity(1)
        setNotes('')
    }, [isOpen])

    const selectedProduct = products.find((p) => p.id === productId)
    const loading = submitting || isLoading

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        if (!productId || quantity < 1) return

        setSubmitting(true)
        try {
            await onSubmit(productId, quantity, notes)
            onClose()
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(next) => !next && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Agregar item</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Producto" required>
                        <Select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            disabled={loading}
                        >
                            <option value="">Selecciona un producto...</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.id}>
                                    {product.name} ·{' '}
                                    {formatCurrency(Number(product.price))}
                                </option>
                            ))}
                        </Select>
                    </FormField>

                    <FormField label="Cantidad" required>
                        <Input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) =>
                                setQuantity(
                                    Math.max(
                                        1,
                                        parseInt(e.target.value) || 1,
                                    ),
                                )
                            }
                            disabled={loading}
                        />
                    </FormField>

                    {selectedProduct && (
                        <div className="rounded-lg bg-surface-muted p-3 text-sm">
                            <span className="text-muted-foreground">
                                Subtotal:{' '}
                            </span>
                            <span className="font-semibold text-foreground">
                                {formatCurrency(
                                    Number(selectedProduct.price) * quantity,
                                )}
                            </span>
                        </div>
                    )}

                    <FormField label="Notas" description="Opcional">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            disabled={loading}
                            placeholder="Ej: sin cebolla, extra picante..."
                            rows={2}
                        />
                    </FormField>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={!productId || quantity < 1 || loading}
                        >
                            {submitting ? 'Agregando...' : 'Agregar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
