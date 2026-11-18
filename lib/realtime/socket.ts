import { io, type Socket } from 'socket.io-client'
import { API_BASE } from '@/lib/http/client'
import type { OrdersClientEvents, OrdersServerEvents } from './events'

export type OrdersSocket = Socket<OrdersServerEvents, OrdersClientEvents>

const IDLE_CLOSE_MS = 1000

let socket: OrdersSocket | null = null
let currentToken: string | null = null
let refs = 0
let closeTimer: ReturnType<typeof setTimeout> | null = null

function baseUrl(): string {
    return process.env.NEXT_PUBLIC_SOCKET_URL || API_BASE
}

function destroy() {
    if (!socket) return
    socket.removeAllListeners()
    socket.disconnect()
    socket = null
    currentToken = null
}

export function acquireOrdersSocket(token: string): OrdersSocket {
    if (closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = null
    }
    if (socket && currentToken !== token) destroy()
    if (!socket) {
        socket = io(`${baseUrl()}/orders`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 15000,
            randomizationFactor: 0.5,
        })
        currentToken = token
    }
    refs += 1
    return socket
}

export function releaseOrdersSocket() {
    refs = Math.max(0, refs - 1)
    if (refs > 0 || closeTimer) return
    closeTimer = setTimeout(() => {
        closeTimer = null
        if (refs === 0) destroy()
    }, IDLE_CLOSE_MS)
}

export function resetSocket() {
    if (closeTimer) {
        clearTimeout(closeTimer)
        closeTimer = null
    }
    refs = 0
    destroy()
}
