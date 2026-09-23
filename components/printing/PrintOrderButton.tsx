'use client'

import React, { useState } from 'react'
import { Printer } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'

interface PrintOrderButtonProps {
    orderId: string
    orderNumber: string
    disabled?: boolean
}

export function PrintOrderButton({
    orderId,
    orderNumber,
    disabled = false,
}: PrintOrderButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePrintOrder = async () => {
        try {
            setLoading(true)

            const response = await fetch(`/api/printing/order/${orderId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })

            if (!response.ok) {
                const errorData = await response
                    .json()
                    .catch(() => ({ error: 'Error desconocido' }))
                throw new Error(
                    errorData.error ||
                        `Error ${response.status}: ${response.statusText}`,
                )
            }

            const data = await response.json()
            if (data.success) {
                toast.success(data.message)
            } else {
                toast.error(data.message || 'Error desconocido al imprimir')
            }
        } catch (error) {
            toast.error(`Error al imprimir: ${getErrorMessage(error, 'Error desconocido')}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            className="w-full"
            onClick={handlePrintOrder}
            disabled={disabled || loading}
            title={
                disabled
                    ? 'La orden debe estar finalizada para imprimir'
                    : `Imprimir orden #${orderNumber}`
            }
        >
            {loading ? <Spinner /> : <Printer />}
            {loading ? 'Imprimiendo...' : 'Imprimir'}
        </Button>
    )
}

export default PrintOrderButton
