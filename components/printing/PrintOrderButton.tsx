'use client'

import React, { useState } from 'react'
import { toast } from '@/components/shared/ToastProvider'

interface PrintOrderButtonProps {
    orderId: string
    orderNumber: string
    disabled?: boolean
}

export function PrintOrderButton({ orderId, orderNumber, disabled = false }: PrintOrderButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePrintOrder = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/printing/order/${orderId}`, {
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
            onClick={handlePrintOrder}
            disabled={disabled || loading}
            className="w-full px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded text-xs font-semibold transition-all"
            title={disabled ? 'La orden debe estar finalizada para imprimir' : `Imprimir orden #${orderNumber}`}
        >
            {loading ? '⏳ Imprimiendo...' : '🖨️ Imprimir'}
        </button>
    )
}
