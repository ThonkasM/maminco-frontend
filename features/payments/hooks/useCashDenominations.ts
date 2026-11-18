'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { parseMoney, roundMoney } from '@/lib/utils/money'
import {
    createCashDenomination,
    deleteCashDenomination,
    listCashDenominations,
    type CashDenominationDto,
} from '../api'
import { STALE_TIME } from '@/lib/query/staleTimes'

export interface NewDenominationForm {
    value: string
    type: 'COIN' | 'BILL'
}

const INITIAL_FORM: NewDenominationForm = {
    value: '',
    type: 'COIN',
}

const KEYS = { all: ['cash-denominations'] as const }

export function useCashDenominations() {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: KEYS.all,
        staleTime: STALE_TIME.reference,
        queryFn: ({ signal }) => listCashDenominations(true, signal),
    })

    const createMutation = useMutation({
        mutationFn: ({ value, type }: { value: number; type: 'COIN' | 'BILL' }) =>
            createCashDenomination(value, type),
        onSuccess: async (created) => {
            toast.success(
                `${created.type === 'COIN' ? 'Moneda' : 'Billete'} de Bs. ${created.value} creado`,
            )
            await queryClient.invalidateQueries({ queryKey: KEYS.all })
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error creando denominación')),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteCashDenomination(id),
        onSuccess: async () => {
            toast.success('Denominación eliminada')
            await queryClient.invalidateQueries({ queryKey: KEYS.all })
        },
        onError: (error) =>
            toast.error(getErrorMessage(error, 'Error eliminando denominación')),
    })

    const createDenomination = async (
        value: string,
        type: 'COIN' | 'BILL',
    ): Promise<boolean> => {
        const numericValue = roundMoney(parseMoney(value.replace(',', '.')))
        if (!Number.isFinite(numericValue) || numericValue <= 0) {
            toast.error('Ingresa un valor válido')
            return false
        }
        try {
            await createMutation.mutateAsync({ value: numericValue, type })
            return true
        } catch {
            return false
        }
    }

    const deleteDenomination = async (id: string): Promise<boolean> => {
        try {
            await deleteMutation.mutateAsync(id)
            return true
        } catch {
            return false
        }
    }

    return {
        denominations: query.data ?? ([] as CashDenominationDto[]),
        loading: query.isLoading,
        error: query.error
            ? getErrorMessage(query.error, 'Error cargando denominaciones')
            : null,
        createDenomination,
        deleteDenomination,
        refresh: () => {
            void query.refetch()
        },
        INITIAL_FORM,
    }
}
