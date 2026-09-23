'use client'
import React, { useState, useEffect } from 'react'
import { ProductResponse, CreateProductPayload } from '@/features/products/api'
import { CategoryResponse } from '@/features/categories/api'

interface ProductFormModalProps {
    isOpen: boolean
    product: ProductResponse | null
    categories: CategoryResponse[]
    existingNames: Set<string>
    onSubmit: (payload: CreateProductPayload) => Promise<void>
    onClose: () => void
    isLoading?: boolean
}

interface FormData {
    name: string
    description: string
    price: string
    categoryId: string
}

interface FormErrors {
    name?: string
    price?: string
    categoryId?: string
}

export default function ProductFormModal({
    isOpen,
    product,
    categories,
    existingNames,
    onSubmit,
    onClose,
    isLoading,
}: ProductFormModalProps) {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        description: '',
        price: '',
        categoryId: '',
    })
    const [formErrors, setFormErrors] = useState<FormErrors>({})
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        if (isOpen) {
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description || '',
                    price: String(product.price),
                    categoryId: product.categoryId,
                })
            } else {
                setFormData({
                    name: '',
                    description: '',
                    price: '',
                    categoryId: '',
                })
            }
            setFormErrors({})
        }
    }, [isOpen, product])

    const validateForm = (): boolean => {
        const errors: FormErrors = {}

        if (!formData.name.trim()) errors.name = 'El nombre del producto es requerido'
        else if (formData.name.trim().length < 2) errors.name = 'Mínimo 2 caracteres'
        else if (
            existingNames.has(formData.name.trim().toLowerCase()) &&
            (!product || product.name.toLowerCase() !== formData.name.trim().toLowerCase())
        )
            errors.name = 'Ya existe un producto con este nombre'

        if (!formData.price) errors.price = 'El precio es requerido'
        else if (isNaN(Number(formData.price))) errors.price = 'Debe ser un número válido'
        else if (Number(formData.price) <= 0) errors.price = 'El precio debe ser mayor a 0'
        else if (!Number.isInteger(Number(formData.price)))
            errors.price = 'El precio debe ser un número entero (sin decimales)'

        if (!formData.categoryId) errors.categoryId = 'La categoría es requerida'

        setFormErrors(errors)
        return Object.keys(errors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validateForm()) return

        setSubmitting(true)
        try {
            const payload: CreateProductPayload = {
                name: formData.name.trim(),
                description: formData.description.trim() || undefined,
                price: Number(formData.price),
                categoryId: formData.categoryId,
            }
            await onSubmit(payload)
            handleClose()
        } finally {
            setSubmitting(false)
        }
    }

    const handleClose = () => {
        setFormData({
            name: '',
            description: '',
            price: '',
            categoryId: '',
        })
        setFormErrors({})
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                    {product ? 'Editar Producto' : 'Nuevo Producto'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => {
                                setFormData({ ...formData, name: e.target.value })
                                if (formErrors.name) setFormErrors({ ...formErrors, name: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.name ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                            placeholder="Ej: Café, Pizza..."
                        />
                        {formErrors.name && <p className="text-red-600 text-sm mt-1">{formErrors.name}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500 resize-none"
                            rows={2}
                            placeholder="Descripción opcional..."
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Precio (Entero, sin decimales) *
                        </label>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-600 dark:text-slate-400">Bs.</span>
                            <input
                                type="number"
                                step="1"
                                min="0"
                                value={formData.price}
                                onChange={(e) => {
                                    setFormData({ ...formData, price: e.target.value })
                                    if (formErrors.price) setFormErrors({ ...formErrors, price: undefined })
                                }}
                                className={`flex-1 px-4 py-2 rounded-lg border ${
                                    formErrors.price ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                                } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                                placeholder="1000"
                            />
                        </div>
                        {formErrors.price && <p className="text-red-600 text-sm mt-1">{formErrors.price}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Categoría *
                        </label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => {
                                setFormData({ ...formData, categoryId: e.target.value })
                                if (formErrors.categoryId) setFormErrors({ ...formErrors, categoryId: undefined })
                            }}
                            className={`w-full px-4 py-2 rounded-lg border ${
                                formErrors.categoryId ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                            } dark:bg-slate-700 dark:text-white focus:outline-none focus:border-blue-500`}
                        >
                            <option value="">Selecciona una categoría...</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {formErrors.categoryId && (
                            <p className="text-red-600 text-sm mt-1">{formErrors.categoryId}</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-medium hover:bg-slate-300 dark:hover:bg-slate-600 transition-all disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:bg-slate-400 transition-all"
                        >
                            {submitting ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
