'use client'

import React, { useState } from 'react'
import { ReceiptText } from 'lucide-react'
import { Button, Spinner } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { printPaymentReceipt } from '@/features/printing/api'
import { getErrorMessage } from '@/lib/utils/errors'

interface PrintPaymentReceiptButtonProps {
    orderId: string
    orderNumber: string
    disabled?: boolean
}

export function PrintPaymentReceiptButton({
    orderId,
    orderNumber,
    disabled = false,
}: PrintPaymentReceiptButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePrintReceipt = async () => {
        try {
            setLoading(true)

            const data = await printPaymentReceipt(orderId)
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
            variant="secondary"
            className="w-full"
            onClick={handlePrintReceipt}
            disabled={disabled || loading}
            title={
                disabled
                    ? 'El pago debe estar confirmado para imprimir el recibo'
                    : `Imprimir recibo de pago de la orden #${orderNumber}`
            }
        >
            {loading ? <Spinner /> : <ReceiptText />}
            {loading ? 'Imprimiendo recibo...' : 'Imprimir recibo de pago'}
        </Button>
    )
}

export default PrintPaymentReceiptButton
