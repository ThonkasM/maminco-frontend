'use client'
import { useState, useCallback, useEffect } from 'react'
import * as adminPaymentsApi from '@/features/payments/api'
import { PaymentMethodDto } from '@/features/payments/api'
import { toast } from '@/components/shared/ToastProvider'

export function usePaymentMethods() {
    const [methods, setMethods] = useState<PaymentMethodDto[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Cargar métodos de pago del seed
    const loadPaymentMethods = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await adminPaymentsApi.listPaymentMethods(true)
            console.log('✓ Métodos cargados:', data)
            setMethods(data)
        } catch (err: any) {
            const message = err.message || 'Error cargando métodos de pago'
            setError(message)
            toast.error(message)
            console.error('Error loading payment methods:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Cargar métodos al montar el componente
    useEffect(() => {
        loadPaymentMethods()
    }, [loadPaymentMethods])

    // Alternar activo/inactivo
    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            setError(null)
            const updated = await adminPaymentsApi.togglePaymentMethodActive(id, !currentStatus)
            setMethods((prev) => prev.map((m) => (m.id === id ? updated : m)))
            toast.success(`Método ${updated.isActive ? 'activado' : 'desactivado'}`)
        } catch (err: any) {
            const message = err.message || 'Error toggling método de pago'
            setError(message)
            toast.error(message)
            console.error('Error toggling payment method:', err)
        }
    }

    // Recargar datos
    const refresh = useCallback(() => {
        loadPaymentMethods()
    }, [loadPaymentMethods])

    return {
        methods,
        loading,
        error,
        handleToggle,
        refresh,
    }
}
