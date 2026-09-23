'use client'

import React, { useState } from 'react'
import { toast } from '@/components/shared/ToastProvider'

interface PrintPaymentReceiptButtonProps {
    orderId: string
    orderNumber: string
    disabled?: boolean
}

export function PrintPaymentReceiptButton({ orderId, orderNumber, disabled = false }: PrintPaymentReceiptButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePrintReceipt = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/printing/payment-receipt/${orderId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Error desconocido' }))
                console.error('Error response:', errorData)
                throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()

            if (data.success) {
                toast.success(data.message)
            } else {
                console.error('Print error:', data)
                toast.error(data.message || 'Error desconocido al imprimir')
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            console.error('Print request error:', errorMessage)
            toast.error(`Error al imprimir: ${errorMessage}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePrintReceipt}
            disabled={disabled || loading}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-semibold transition-all text-sm"
            title={disabled ? 'El pago debe estar confirmado para imprimir recibo' : `Imprimir recibo de pago para orden #${orderNumber}`}
        >
            {loading ? '⏳ Imprimiendo recibo...' : '🧾 Imprimir Recibo de Pago'}
        </button>
    )
}
