'use client'
import React, { useState } from 'react'
import { ServiceType } from '@/lib/api/negocio/orders'
import { toast } from '@/components/ToastProvider'

interface CreateServiceOrderModalProps {
    isOpen: boolean
    serviceType: 'DELIVERY' | 'RECOGER'
    onClose: () => void
    onSubmit: (data: {
        clientName: string
        clientPhone: string
        clientAddress?: string
    }) => Promise<void>
    isLoading?: boolean
}

export const CreateServiceOrderModal: React.FC<CreateServiceOrderModalProps> = ({
    isOpen,
    serviceType,
    onClose,
    onSubmit,
    isLoading = false,
}) => {
    const [clientName, setClientName] = useState('')
    const [clientPhone, setClientPhone] = useState('')
    const [clientAddress, setClientAddress] = useState('')

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!clientName.trim()) {
            toast.error('Por favor ingresa el nombre del cliente')
            return
        }

        if (!clientPhone.trim()) {
            toast.error('Por favor ingresa el teléfono del cliente')
            return
        }

        if (serviceType === 'DELIVERY' && !clientAddress.trim()) {
            toast.error('Por favor ingresa la dirección de entrega')
            return
        }

        try {
            await onSubmit({
                clientName: clientName.trim(),
                clientPhone: clientPhone.trim(),
                clientAddress: serviceType === 'DELIVERY' ? clientAddress.trim() : undefined,
            })

            // Limpiar formulario
            setClientName('')
            setClientPhone('')
            setClientAddress('')
            onClose()
        } catch (err: any) {
            toast.error(err.message || 'Error creando orden')
        }
    }

    const handleClose = () => {
        setClientName('')
        setClientPhone('')
        setClientAddress('')
        onClose()
    }

    const title = serviceType === 'DELIVERY' ? 'Nueva Orden de Delivery' : 'Nueva Orden para Recoger'
    const icon = serviceType === 'DELIVERY' ? '🚗' : '📦'

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full p-6 shadow-xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <span className="text-3xl">{icon}</span>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            {title}
                        </h2>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Cliente */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Nombre del Cliente
                        </label>
                        <input
                            type="text"
                            value={clientName}
                            onChange={(e) => setClientName(e.target.value)}
                            placeholder="ej: Juan Pérez"
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Teléfono */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                            Teléfono
                        </label>
                        <input
                            type="tel"
                            value={clientPhone}
                            onChange={(e) => setClientPhone(e.target.value)}
                            placeholder="ej: +591 7654321"
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        />
                    </div>

                    {/* Dirección (solo para Delivery) */}
                    {serviceType === 'DELIVERY' && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Dirección de Entrega
                            </label>
                            <textarea
                                value={clientAddress}
                                onChange={(e) => setClientAddress(e.target.value)}
                                placeholder="ej: Calle Principal 123, Apto 5B"
                                disabled={isLoading}
                                rows={3}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 resize-none"
                            />
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500 text-slate-900 dark:text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isLoading ? '⏳' : '✓'}
                            {isLoading ? 'Creando...' : 'Crear Orden'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreateServiceOrderModal
