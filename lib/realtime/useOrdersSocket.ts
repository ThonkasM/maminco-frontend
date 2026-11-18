'use client'
import { useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ORDERS_EVENT_NAMES, type OrdersServerEvents } from './events'
import { acquireOrdersSocket, releaseOrdersSocket } from './socket'

export interface UseOrdersSocketOptions {
    tableId?: string
    subscribeToTablesStatus?: boolean
    subscribeToKitchen?: boolean
    on?: Partial<OrdersServerEvents>
    onConnect?: () => void
    onDisconnect?: () => void
}

export function useOrdersSocket(options: UseOrdersSocketOptions) {
    const token = useAuth((s) => s.token)
    const optionsRef = useRef(options)
    const { tableId, subscribeToTablesStatus, subscribeToKitchen } = options

    useEffect(() => {
        optionsRef.current = options
    })

    useEffect(() => {
        if (!token) return
        const socket = acquireOrdersSocket(token)

        const handleConnect = () => {
            const current = optionsRef.current
            if (current.tableId) socket.emit('join:table', current.tableId)
            if (current.subscribeToTablesStatus) socket.emit('subscribe:tables:status')
            if (current.subscribeToKitchen) socket.emit('subscribe:kitchen')
            current.onConnect?.()
        }
        const handleDisconnect = () => optionsRef.current.onDisconnect?.()

        const dispatchers = ORDERS_EVENT_NAMES.map((name) => {
            const listener = (payload: unknown) => {
                const handler = optionsRef.current.on?.[name] as
                    | ((event: unknown) => void)
                    | undefined
                handler?.(payload)
            }
            ;(socket as unknown as {
                on: (event: string, cb: (payload: unknown) => void) => void
            }).on(name, listener)
            return { name, listener }
        })

        socket.on('connect', handleConnect)
        socket.on('disconnect', handleDisconnect)
        if (socket.connected) handleConnect()

        return () => {
            const raw = socket as unknown as {
                off: (event: string, cb: (payload: unknown) => void) => void
            }
            for (const { name, listener } of dispatchers) raw.off(name, listener)
            socket.off('connect', handleConnect)
            socket.off('disconnect', handleDisconnect)
            if (socket.connected) {
                const current = optionsRef.current
                if (current.subscribeToTablesStatus) socket.emit('unsubscribe:tables:status')
                if (current.subscribeToKitchen) socket.emit('unsubscribe:kitchen')
                if (current.tableId) socket.emit('leave:table', current.tableId)
            }
            releaseOrdersSocket()
        }
    }, [token, subscribeToTablesStatus, subscribeToKitchen])

    useEffect(() => {
        if (!token || !tableId) return
        const socket = acquireOrdersSocket(token)
        if (socket.connected) socket.emit('join:table', tableId)
        return () => {
            if (socket.connected) socket.emit('leave:table', tableId)
            releaseOrdersSocket()
        }
    }, [token, tableId])
}
