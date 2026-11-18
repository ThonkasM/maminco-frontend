'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { getAdminMenu, setAvailability, updateMenuNote, type AdminMenu } from './api'

const KEY = ['menu', 'admin'] as const

export function useAdminMenu() {
    return useQuery({ queryKey: KEY, queryFn: ({ signal }) => getAdminMenu(signal) })
}

export function useSetAvailability(onSaved?: () => void) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: setAvailability,
        onMutate: async ({ productIds, isAvailable }) => {
            await queryClient.cancelQueries({ queryKey: KEY })
            const previous = queryClient.getQueryData<AdminMenu>(KEY)
            if (previous) {
                const ids = new Set(productIds)
                const sections = previous.sections.map((section) => ({
                    ...section,
                    products: section.products.map((product) => (ids.has(product.id) ? { ...product, isAvailable } : product)),
                }))
                const all = sections.flatMap((section) => section.products)
                queryClient.setQueryData<AdminMenu>(KEY, {
                    ...previous,
                    sections,
                    totals: { products: all.length, available: all.filter((product) => product.isAvailable).length },
                })
            }
            return { previous }
        },
        onError: (error, _vars, context) => {
            if (context?.previous) queryClient.setQueryData(KEY, context.previous)
            toast.error(getErrorMessage(error, 'No se pudo actualizar la disponibilidad.'))
        },
        onSettled: () => {
            void queryClient.invalidateQueries({ queryKey: KEY })
            onSaved?.()
        },
    })
}

export function useUpdateNote(onSaved?: () => void) {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: updateMenuNote,
        onSuccess: () => {
            toast.success('El mensaje ya aparece en la carta pública.', 'Mensaje guardado')
            void queryClient.invalidateQueries({ queryKey: KEY })
            onSaved?.()
        },
        onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar el mensaje.')),
    })
}
