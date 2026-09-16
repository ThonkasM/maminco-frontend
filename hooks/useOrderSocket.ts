'use client'
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuth } from './useAuth'

interface UseOrderSocketOptions {
    onOrderCreated?: (data: any) => void
    onOrderUpdated?: (data: any) => void
    onOrderItemAdded?: (data: any) => void
    onOrderItemRemoved?: (data: any) => void
    onOrderStatusChanged?: (data: any) => void
    onTableStateUpdated?: (data: any) => void
    onTableStatusChanged?: (data: any) => void
    onTablesStateSnapshot?: (data: any) => void
    tableId?: string
}

export function useOrderSocket(options: UseOrderSocketOptions) {
    const socketRef = useRef<Socket | null>(null)
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)
    const callbacksRef = useRef(options)

    // Actualizar callbacks sin reiniciar conexión
    useEffect(() => {
        callbacksRef.current = options
    }, [options])

    // Conectar al WebSocket UNA SOLA VEZ
    useEffect(() => {
        if (!user || !token) {
            console.log('⏳ Esperando autenticación para conectar WebSocket...')
            return
        }

        // Si ya está conectado, solo cambiar de mesa
        if (socketRef.current?.connected) {
            console.log('♻️ Socket ya conectado, solo cambiando de mesa')
            if (options.tableId) {
                socketRef.current?.emit('join:table', options.tableId)
            }
            return
        }

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        console.log('🔌 Conectando a WebSocket:', apiUrl)

        socketRef.current = io(`${apiUrl}/orders`, {
            auth: {
                token: token,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5,
        })

        // Conexión establecida
        socketRef.current.on('connect', () => {
            console.log('✅ WebSocket conectado:', socketRef.current?.id)

            if (options.tableId) {
                console.log(`📍 Uniéndose a mesa: ${options.tableId}`)
                socketRef.current?.emit('join:table', options.tableId)
            }
        })

        // Eventos de órdenes - usar callbacks ref para evitar closures
        socketRef.current.on('order:created', (data) => {
            console.log('📢 [order:created]:', data)
            callbacksRef.current.onOrderCreated?.(data)
        })

        socketRef.current.on('order:updated', (data) => {
            console.log('📢 [order:updated]:', data)
            callbacksRef.current.onOrderUpdated?.(data)
        })

        socketRef.current.on('order:item:added', (data) => {
            console.log('📢 [order:item:added]:', data)
            callbacksRef.current.onOrderItemAdded?.(data)
        })

        socketRef.current.on('order:item:removed', (data) => {
            console.log('📢 [order:item:removed]:', data)
            callbacksRef.current.onOrderItemRemoved?.(data)
        })

        socketRef.current.on('order:status:changed', (data) => {
            console.log('📢 [order:status:changed]:', data)
            callbacksRef.current.onOrderStatusChanged?.(data)
        })

        // Eventos globales de estado de mesa
        socketRef.current.on('table:state:updated', (data) => {
            console.log('📊 [table:state:updated]:', data)
            callbacksRef.current.onTableStateUpdated?.(data)
        })

        socketRef.current.on('tables:status:changed', (data) => {
            console.log('📊 [tables:status:changed]:', data)
            callbacksRef.current.onTableStatusChanged?.(data)
        })

        socketRef.current.on('tables:state:snapshot', (data) => {
            console.log('📋 [tables:state:snapshot]:', data)
            callbacksRef.current.onTablesStateSnapshot?.(data)
        })

        // Errores
        socketRef.current.on('connect_error', (error) => {
            console.error('❌ Error de conexión WebSocket:', error)
        })

        socketRef.current.on('disconnect', (reason) => {
            console.log('⏹️ WebSocket desconectado:', reason)
        })

        // Cleanup solo al desmontar componente
        return () => {
            console.log('🧹 Limpiando WebSocket...')
            socketRef.current?.disconnect()
            socketRef.current = null
        }
    }, [user?.id, token]) // Dependencias mínimas

    // Actualizar mesa cuando cambia tableId
    useEffect(() => {
        if (!socketRef.current?.connected || !options.tableId) return

        console.log(`📍 Cambiando a mesa: ${options.tableId}`)
        socketRef.current.emit('join:table', options.tableId)
    }, [options.tableId])

    return socketRef.current
}
