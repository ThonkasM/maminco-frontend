'use client'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from '@/hooks/useAuth'

interface UseOrderSocketOptions {
    onConnect?: () => void
    onDisconnect?: () => void
    onOrderCreated?: (data: any) => void
    onOrderUpdated?: (data: any) => void
    onOrderItemAdded?: (data: any) => void
    onOrderItemRemoved?: (data: any) => void
    onOrderStatusChanged?: (data: any) => void
    onTableStateUpdated?: (data: any) => void
    onTableStatusChanged?: (data: any) => void
    onTablesStateSnapshot?: (data: any) => void
    subscribeToTablesStatus?: boolean
    tableId?: string
}

export function useOrderSocket(options: UseOrderSocketOptions) {
    const socketRef = useRef<Socket | null>(null)
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)
    const callbacksRef = useRef(options)

    useEffect(() => {
        callbacksRef.current = options
    }, [options])

    useEffect(() => {
        if (!user || !token) return

        if (socketRef.current?.connected) {
            if (options.tableId) {
                socketRef.current?.emit('join:table', options.tableId)
            }
            return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

        socketRef.current = io(`${apiUrl}/orders`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })

        socketRef.current.on('connect', () => {
            if (options.tableId) {
                socketRef.current?.emit('join:table', options.tableId)
            }
            if (callbacksRef.current.subscribeToTablesStatus) {
                socketRef.current?.emit('subscribe:tables:status')
            }
            callbacksRef.current.onConnect?.()
        })

        socketRef.current.on('order:created', (data) => {
            callbacksRef.current.onOrderCreated?.(data)
        })

        socketRef.current.on('order:updated', (data) => {
            callbacksRef.current.onOrderUpdated?.(data)
        })

        socketRef.current.on('order:item:added', (data) => {
            callbacksRef.current.onOrderItemAdded?.(data)
        })

        socketRef.current.on('order:item:removed', (data) => {
            callbacksRef.current.onOrderItemRemoved?.(data)
        })

        socketRef.current.on('order:status:changed', (data) => {
            callbacksRef.current.onOrderStatusChanged?.(data)
        })

        socketRef.current.on('table:state:updated', (data) => {
            callbacksRef.current.onTableStateUpdated?.(data)
        })

        socketRef.current.on('tables:status:changed', (data) => {
            callbacksRef.current.onTableStatusChanged?.(data)
        })

        socketRef.current.on('tables:state:snapshot', (data) => {
            callbacksRef.current.onTablesStateSnapshot?.(data)
        })

        socketRef.current.on('disconnect', () => {
            callbacksRef.current.onDisconnect?.()
        })

        return () => {
            if (callbacksRef.current.subscribeToTablesStatus) {
                socketRef.current?.emit('unsubscribe:tables:status')
            }
            socketRef.current?.disconnect()
            socketRef.current = null
        }
    }, [user?.id, token])

    useEffect(() => {
        if (!socketRef.current?.connected || !options.tableId) return
        socketRef.current.emit('join:table', options.tableId)
    }, [options.tableId])

    return socketRef.current
}
