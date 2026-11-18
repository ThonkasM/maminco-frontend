'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import {
    getHistory,
    getInbox,
    getRules,
    markAllRead,
    markRead,
    sendNotification,
    updateRule,
    type AutomaticType,
} from './api'
import type { UserRole } from '@/lib/types/enums'

const KEYS = { inbox: ['notifications', 'inbox'] as const, history: ['notifications', 'history'] as const, rules: ['notifications', 'rules'] as const }

export function useInbox(enabled = true) {
    return useQuery({
        queryKey: KEYS.inbox,
        queryFn: ({ signal }) => getInbox(signal),
        refetchInterval: 20_000,
        refetchOnWindowFocus: true,
        enabled,
    })
}

export function useMarkRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (id: string) => markRead(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.inbox }),
    })
}

export function useMarkAllRead() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: markAllRead,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.inbox }),
    })
}

export function useHistory() {
    return useQuery({ queryKey: KEYS.history, queryFn: ({ signal }) => getHistory(signal) })
}

export function useRules() {
    return useQuery({ queryKey: KEYS.rules, queryFn: ({ signal }) => getRules(signal) })
}

export function useSendNotification() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: (body: { title: string; body: string; roles?: UserRole[]; userIds?: string[] }) => sendNotification(body),
        onSuccess: (result) => {
            toast.success(`Se envió a ${result.recipients} persona${result.recipients === 1 ? '' : 's'}.`, 'Notificación enviada')
            void queryClient.invalidateQueries({ queryKey: KEYS.history })
        },
        onError: (error) => toast.error(getErrorMessage(error, 'No se pudo enviar la notificación.')),
    })
}

export function useUpdateRule() {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: ({ type, ...body }: { type: AutomaticType; enabled: boolean; audienceRoles: UserRole[] }) => updateRule(type, body),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.rules }),
        onError: (error) => toast.error(getErrorMessage(error, 'No se pudo guardar la regla.')),
    })
}
