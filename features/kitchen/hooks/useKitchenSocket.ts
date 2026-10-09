'use client'
import { useEffect, useRef } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'

const KITCHEN_KEY = ['kitchen', 'orders'] as const

/**
 * Se suscribe a la sala `kitchen` del namespace `orders` y refresca la lista
 * ante cualquier cambio de orden, items o estado de cocina.
 */
export function useKitchenSocket() {
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)
    const queryClient = useQueryClient()
    const socketRef = useRef<Socket | null>(null)

    useEffect(() => {
        if (!user || !token) return

        const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const socket = io(`${apiUrl}/orders`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })
        socketRef.current = socket

        const refresh = () => {
            void queryClient.invalidateQueries({ queryKey: KITCHEN_KEY })
        }

        socket.on('connect', () => socket.emit('subscribe:kitchen'))
        socket.on('order:created', refresh)
        socket.on('order:item:added', refresh)
        socket.on('order:item:removed', refresh)
        socket.on('order:item:updated', refresh)
        socket.on('order:status:changed', refresh)
        socket.on('order:kitchen-status:changed', refresh)
        socket.on('kitchen:orders:snapshot', refresh)

        return () => {
            socket.emit('unsubscribe:kitchen')
            socket.disconnect()
            socketRef.current = null
        }
    }, [user, token, queryClient])
}
