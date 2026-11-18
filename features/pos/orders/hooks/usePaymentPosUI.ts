import { useState } from 'react'

interface UsePaymentNegocioUIReturn {
    showPaymentModal: boolean

    paymentMode: boolean
    selectedPaymentMethod: string | null
    paymentLoading: boolean

    handleOpenPaymentModal: () => void
    handleClosePaymentModal: () => void

    handleSelectPaymentMethod: (methodId: string) => void

    handleResetPaymentSelection: () => void

    setShowPaymentModal: (show: boolean) => void
    setPaymentMode: (mode: boolean) => void
    setSelectedPaymentMethod: (methodId: string | null) => void
    setPaymentLoading: (loading: boolean) => void
}

/**
 * Hook que gestiona TODO el estado UI de pagos en ordenes-negocio
 * Responsabilidades:
 * - Modal de selección de método de pago
 * - Estado del flujo de pago
 * - Selección de método de pago actual
 * - Estado de carga durante procesamiento de pago
 */
export function usePaymentPosUI(): UsePaymentNegocioUIReturn {
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [paymentMode, setPaymentMode] = useState(false)
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null)
    const [paymentLoading, setPaymentLoading] = useState(false)

    const handleOpenPaymentModal = () => {
        setShowPaymentModal(true)
        setPaymentMode(true)
    }

    const handleClosePaymentModal = () => {
        setShowPaymentModal(false)
        setPaymentMode(false)
    }

    const handleSelectPaymentMethod = (methodId: string) => {
        setSelectedPaymentMethod(methodId)
    }

    const handleResetPaymentSelection = () => {
        setSelectedPaymentMethod(null)
    }

    return {
        showPaymentModal,
        paymentMode,
        selectedPaymentMethod,
        paymentLoading,
        handleOpenPaymentModal,
        handleClosePaymentModal,
        handleSelectPaymentMethod,
        handleResetPaymentSelection,
        setShowPaymentModal,
        setPaymentMode,
        setSelectedPaymentMethod,
        setPaymentLoading,
    }
}
