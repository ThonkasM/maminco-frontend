'use client'
import { useState, useCallback, useEffect } from 'react'
import * as adminPaymentsApi from '@/lib/api/admin/payments'
import { CashDenominationDto } from '@/lib/api/admin/payments'
import { toast } from '@/components/ToastProvider'

interface NewDenominationForm {
    value: string
    type: 'COIN' | 'BILL'
}

const INITIAL_FORM: NewDenominationForm = {
    value: '',
    type: 'COIN',
}

export function useCashDenominations() {
    const [denominations, setDenominations] = useState<CashDenominationDto[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Cargar denominaciones
    const loadDenominations = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            console.log('📡 Cargando denominaciones desde backend...')
            const data = await adminPaymentsApi.listCashDenominations(true)
            console.log('✅ Denominaciones cargadas:', data)
            setDenominations(data)
        } catch (err: any) {
            const message = err.message || 'Error cargando denominaciones'
            setError(message)
            toast.error(message)
            console.error('❌ Error loading denominations:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    // Cargar denominaciones al montar
    useEffect(() => {
        loadDenominations()
    }, [loadDenominations])

    // Crear nueva denominación
    const createDenomination = async (value: string, type: 'COIN' | 'BILL'): Promise<boolean> => {
        if (!value.trim() || value === '0') {
            toast.error('Ingresa un valor válido')
            return false
        }

        try {
            setError(null)
            const newDenom = await adminPaymentsApi.createCashDenomination(parseInt(value), type)
            console.log('✅ Denominación creada:', newDenom)
            setDenominations((prev) => [...prev, newDenom])
            toast.success(`${type === 'COIN' ? 'Moneda' : 'Billete'} de Bs. ${value} creado`)
            return true
        } catch (err: any) {
            const message = err.message || 'Error creando denominación'
            setError(message)
            toast.error(message)
            console.error('❌ Error creating denomination:', err)
            return false
        }
    }

    // Eliminar denominación
    const deleteDenomination = async (id: string): Promise<boolean> => {
        try {
            setError(null)
            await adminPaymentsApi.deleteCashDenomination(id)
            setDenominations((prev) => prev.filter((d) => d.id !== id))
            toast.success('Denominación eliminada')
            return true
        } catch (err: any) {
            const message = err.message || 'Error eliminando denominación'
            setError(message)
            toast.error(message)
            console.error('❌ Error deleting denomination:', err)
            return false
        }
    }

    // Recargar datos
    const refresh = useCallback(() => {
        loadDenominations()
    }, [loadDenominations])

    return {
        denominations,
        loading,
        error,
        createDenomination,
        deleteDenomination,
        refresh,
        INITIAL_FORM,
    }
}
