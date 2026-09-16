'use client'
import React, { useState } from 'react'
import { ProductResponse } from '@/lib/api/admin/products'
import { formatCurrency } from '@/lib/utils/currency'

interface AddItemModalProps {
    isOpen: boolean
    products: ProductResponse[]
    onSubmit: (productId: string, quantity: number, notes: string) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

export default function AddItemModal({ isOpen, products, onSubmit, onClose, isLoading }: AddItemModalProps) {
    const [productId, setProductId] = useState('')
    const [quantity, setQuantity] = useState(1)
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        if (!productId || quantity < 1) return

        setSubmitting(true)
        try {
            await onSubmit(productId, quantity, notes)
            setProductId('')
            setQuantity(1)
            setNotes('')
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setProductId('')
        setQuantity(1)
        setNotes('')
        onClose()
    }

    if (!isOpen) return null

    const selectedProduct = products.find((p) => p.id === productId)

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">+ Agregar Item</h3>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>

                {/* Product Selection */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Producto
                    </label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    >
                        <option value="">Selecciona un producto...</option>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name} • {formatCurrency(Number(p.price))}
                            </option>
                        ))}
                    </select>
                    {selectedProduct && (
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Precio: {formatCurrency(Number(selectedProduct.price))} | Categoría: {selectedProduct.categoryId}
                        </p>
                    )}
                </div>

                {/* Quantity */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Cantidad
                    </label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50"
                    />
                </div>

                {/* Subtotal Preview */}
                {selectedProduct && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <p className="text-sm text-slate-700 dark:text-slate-300">
                            Subtotal: <span className="font-bold text-blue-600 dark:text-blue-400">
                                {formatCurrency(Number(selectedProduct.price) * quantity)}
                            </span>
                        </p>
                    </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Notas (opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        disabled={submitting}
                        placeholder="Ej: sin cebolla, extra picante..."
                        rows={2}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white disabled:opacity-50 resize-none"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={handleSubmit}
                        disabled={!productId || quantity < 1 || submitting}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {submitting ? 'Agregando...' : 'Agregar'}
                    </button>
                    <button
                        onClick={handleClose}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white rounded-lg transition-all disabled:opacity-50 font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    )
}
