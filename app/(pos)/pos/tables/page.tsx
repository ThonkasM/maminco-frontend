'use client'
import React, { useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { getTables, TableResponse } from '@/lib/api/admin/tables'
import { getActiveOrderByTable, createOrderIfNotExists } from '@/lib/api/pos/orders'
import { getActiveAreas, AreaResponse } from '@/lib/api/admin/areas'
import { toast } from '@/components/ToastProvider'
import { useAuth } from '@/hooks/useAuth'
import { usePosTablesUI } from './hooks/usePosTablesUI'

export default function MesasNegocioPage() {
    const router = useRouter()
    const { selectedAreaId, isLoading, handleSelectArea, setIsLoading } = usePosTablesUI()

    const [areas, setAreas] = React.useState<AreaResponse[]>([])
    const [tables, setTables] = React.useState<TableResponse[]>([])
    const [activeOrders, setActiveOrders] = React.useState<Record<string, boolean>>({})
    const [sidebarOpen, setSidebarOpen] = React.useState(true)
    const socketRef = useRef<Socket | null>(null)
    const user = useAuth((s) => s.user)
    const token = useAuth((s) => s.token)

    useEffect(() => {
        loadData()
    }, [])

    // Conectar al WebSocket para escuchar cambios en órdenes
    useEffect(() => {
        if (!user || !token) return

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        socketRef.current = io(`${apiUrl}/orders`, {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        })

        socketRef.current.on('connect', () => {
            console.log('✅ WebSocket conectado en mesas')
            // Suscribirse a cambios globales de estado de mesas
            socketRef.current?.emit('subscribe:tables:status')
        })

        // ==========================================
        // EVENTO GLOBAL: Snapshot de todas las mesas
        // ==========================================
        socketRef.current.on('tables:state:snapshot', (data) => {
            console.log('� Snapshot de todas las mesas recibido:', data.tables.length)
            if (data.tables && Array.isArray(data.tables)) {
                const states: Record<string, boolean> = {}
                for (const table of data.tables) {
                    // Mesa ocupada si tiene orden activa en estado DRAFT
                    states[table.id] = table.hasActiveOrder
                }
                setActiveOrders(states)
            }
        })

        // ==========================================
        // EVENTO GLOBAL: Cambio de estado de mesa
        // ==========================================
        socketRef.current.on('tables:status:changed', (data) => {
            console.log('� Estado de mesa cambió (global):', data)
            if (data.tableId && data.status) {
                // OCCUPIED (con orden) o AVAILABLE (sin orden)
                const isOccupied = data.status === 'OCCUPIED'
                console.log(`  📍 Mesa ${data.tableId} → ${isOccupied ? '🔴 OCCUPIED' : '🟢 AVAILABLE'}`)
                setActiveOrders((prev) => ({
                    ...prev,
                    [data.tableId]: isOccupied,
                }))
            }
        })

        // ==========================================
        // EVENTO ESPECÍFICO: Estado completo de la mesa
        // (cuando se entra a POS de una mesa específica)
        // ==========================================
        socketRef.current.on('table:state:updated', (data) => {
            console.log('� Estado completo de mesa actualizado:', data)
            if (data.tableId && data.orderState) {
                const isOccupied = !!data.orderState && data.orderState.status === 'DRAFT'
                console.log(`  📍 Mesa ${data.tableId} → Ocupada: ${isOccupied}`)
                setActiveOrders((prev) => ({
                    ...prev,
                    [data.tableId]: isOccupied,
                }))
            }
        })

        // ==========================================
        // EVENTOS ESPECÍFICOS PARA DEBUGGING
        // ==========================================

        socketRef.current.on('order:created', (data) => {
            console.log('📢 [order:created]', data)
        })

        socketRef.current.on('order:item:added', (data) => {
            console.log('� [order:item:added]', data)
        })

        socketRef.current.on('order:item:removed', (data) => {
            console.log('📢 [order:item:removed]', data)
        })

        socketRef.current.on('order:status:changed', (data) => {
            console.log('📢 [order:status:changed]', data)
        })

        socketRef.current.on('order:updated', (data) => {
            console.log('📢 [order:updated]', data)
        })

        // ==========================================
        // Refrescar cada 120 segundos como fallback
        // ==========================================
        const refreshOrderStates = async () => {
            try {
                const tablesData = await getTables(1, 1000)
                const orders: Record<string, boolean> = {}
                for (const table of tablesData.data) {
                    try {
                        const order = await getActiveOrderByTable(table.id)
                        orders[table.id] = !!order && order.status === 'DRAFT'
                    } catch {
                        orders[table.id] = false
                    }
                }
                setActiveOrders(orders)
            } catch (err) {
                console.error('❌ Error refrescando estados:', err)
            }
        }

        const refreshInterval = setInterval(() => {
            console.log('🔄 Refrescando estados (fallback cada 120s)...')
            refreshOrderStates()
        }, 120000)

        return () => {
            clearInterval(refreshInterval)
            socketRef.current?.emit('unsubscribe:tables:status')
            socketRef.current?.disconnect()
        }
    }, [user, token])

    const loadData = async () => {
        setIsLoading(true)
        try {
            // Cargar áreas activas
            const areasData = await getActiveAreas()
            setAreas(areasData)

            // Seleccionar la primera área por defecto
            if (areasData.length > 0) {
                handleSelectArea(areasData[0].id)
            }

            // Cargar todas las mesas
            const tablesData = await getTables(1, 1000)
            setTables(tablesData.data)

            // Cargar órdenes activas para cada mesa
            const orders: Record<string, boolean> = {}
            for (const table of tablesData.data) {
                try {
                    const order = await getActiveOrderByTable(table.id)
                    orders[table.id] = !!order
                } catch {
                    orders[table.id] = false
                }
            }
            setActiveOrders(orders)
        } catch (err: any) {
            toast.error(err.message || 'Error cargando datos')
        } finally {
            setIsLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        const colors = {
            AVAILABLE: 'bg-green-500 hover:bg-green-600',
            OCCUPIED: 'bg-red-500 hover:bg-red-600',
            RESERVED: 'bg-yellow-500 hover:bg-yellow-600',
        }
        return colors[status as keyof typeof colors] || 'bg-slate-400'
    }

    const getStatusLabel = (status: string) => {
        const labels = {
            AVAILABLE: '✓ Disponible',
            OCCUPIED: '⊙ Ocupada',
            RESERVED: '⊗ Reservada',
        }
        return labels[status as keyof typeof labels] || status
    }

    // Determinar el estado real de una mesa: si tiene orden activa = OCCUPIED, sino = su status original
    const getTableStatus = (table: TableResponse): string => {
        if (activeOrders[table.id]) {
            return 'OCCUPIED'
        }
        return table.status
    }

    // Separar áreas físicas y virtuales
    const { physicalAreas, virtualAreas } = useMemo(() => {
        const physical = areas.filter(a => !a.isVirtual)
        const virtual = areas.filter(a => a.isVirtual)
        return { physicalAreas: physical, virtualAreas: virtual }
    }, [areas])

    // Calcular estadísticas por área
    const getAreaStats = (areaId: string) => {
        const areaTables = tables.filter(t => t.areaId === areaId)
        const occupied = areaTables.filter(t => activeOrders[t.id]).length
        const available = areaTables.length - occupied
        return { total: areaTables.length, occupied, available }
    }

    if (isLoading) {
        return (
            <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin mb-4">⌛</div>
                    <p className="text-slate-600 dark:text-slate-400">Cargando datos...</p>
                </div>
            </div>
        )
    }

    // Filtrar mesas según área seleccionada
    const filteredTables = selectedAreaId
        ? tables.filter(t => t.areaId === selectedAreaId)
        : tables

    return (
        <div className="h-full flex overflow-hidden bg-slate-50 dark:bg-slate-900">
            {/* SIDEBAR */}
            <aside
                className={`
                    fixed md:static top-0 left-0 z-30 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
                    transition-transform duration-300 overflow-y-auto
                    ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-64'}
                `}
            >
                {/* Botón cerrar sidebar (solo móvil) */}
                <div className="md:hidden sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 dark:text-white">Áreas</h3>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                    >
                        ✕
                    </button>
                </div>

                {/* Áreas Físicas */}
                <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        <span>🏢</span>
                        <span>Áreas Físicas</span>
                    </div>
                    <div className="space-y-2 mb-6">
                        {physicalAreas.map((area) => {
                            const stats = getAreaStats(area.id)
                            const isSelected = selectedAreaId === area.id
                            return (
                                <button
                                    key={area.id}
                                    onClick={() => {
                                        handleSelectArea(area.id)
                                        setSidebarOpen(false) // Cerrar sidebar en mobile
                                    }}
                                    className={`
                                        w-full px-4 py-3 rounded-lg transition-all duration-200 text-left
                                        ${isSelected
                                            ? 'bg-blue-600 text-white shadow-lg'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                        }
                                    `}
                                >
                                    <div className="font-semibold text-sm">{area.name}</div>
                                    <div className={`text-xs mt-1 ${isSelected ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                        📊 {stats.available} libre{stats.available !== 1 ? 's' : ''} / {stats.total} tables
                                    </div>
                                    {stats.occupied > 0 && (
                                        <div className={`text-xs mt-1 font-semibold ${isSelected ? 'text-blue-100' : 'text-red-600 dark:text-red-400'}`}>
                                            🔴 {stats.occupied} ocupada{stats.occupied !== 1 ? 's' : ''}
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Divisor */}
                    {virtualAreas.length > 0 && <div className="h-px bg-slate-200 dark:bg-slate-700 my-4"></div>}

                    {/* Áreas Virtuales */}
                    {virtualAreas.length > 0 && (
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                                <span>☁️</span>
                                <span>Servicios Especiales</span>
                            </div>
                            <div className="space-y-2">
                                {virtualAreas.map((area) => {
                                    const isSelected = selectedAreaId === area.id
                                    return (
                                        <button
                                            key={area.id}
                                            onClick={() => {
                                                handleSelectArea(area.id)
                                                setSidebarOpen(false) // Cerrar sidebar en mobile
                                            }}
                                            className={`
                                                w-full px-4 py-3 rounded-lg transition-all duration-200 text-left
                                                ${isSelected
                                                    ? 'bg-purple-600 text-white shadow-lg'
                                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600'
                                                }
                                            `}
                                        >
                                            <div className="font-semibold text-sm">{area.name}</div>
                                            <div className={`text-xs mt-1 ${isSelected ? 'text-purple-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                                Servicio virtual
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {/* Overlay en mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 overflow-auto flex flex-col">
                {/* Botón toggle sidebar (solo móvil) */}
                <div className="md:hidden sticky top-0 z-20 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-2">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                    >
                        ☰
                    </button>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {areas.find(a => a.id === selectedAreaId)?.name || 'Selecciona un área'}
                    </span>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            🏪 Centro de Órdenes
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400">
                            Selecciona una table para crear o continuar con una order
                        </p>
                    </div>

                    {/* Información del área seleccionada */}
                    {selectedAreaId && (
                        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <p className="text-sm text-blue-900 dark:text-blue-200">
                                📊 Mostrando {filteredTables.length} table{filteredTables.length !== 1 ? 's' : ''} en esta área
                            </p>
                        </div>
                    )}

                    {/* Grid de Mesas */}
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                            Tables
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {filteredTables.map((table) => (
                                <Link
                                    key={table.id}
                                    href={`/pos/orders/${table.id}`}
                                    className="group"
                                >
                                    <div className={`
                                        relative w-full aspect-square rounded-lg transition-all duration-300
                                        transform hover:scale-105 cursor-pointer shadow-lg
                                        ${getStatusColor(getTableStatus(table))}
                                        text-white font-bold text-center flex flex-col items-center justify-center
                                        overflow-hidden
                                    `}>
                                        {/* Badge de orden activa */}
                                        {activeOrders[table.id] && (
                                            <div className="absolute top-2 right-2 w-4 h-4 bg-blue-300 rounded-full animate-pulse" title="Orden activa" />
                                        )}

                                        {/* Contenido */}
                                        <div className="text-5xl mb-2">🪑</div>
                                        <div className="text-xl font-bold">Table {table.number}</div>
                                        <div className="text-sm opacity-90 mt-1">{getStatusLabel(getTableStatus(table))}</div>

                                        {/* Hover: mostrar acción */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all flex items-end justify-center pb-3">
                                            <span className="text-sm font-semibold">
                                                {activeOrders[table.id] ? '📝 Continuar' : '📋 Nueva Orden'}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Estado vacío para el área */}
                        {filteredTables.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-slate-600 dark:text-slate-400">
                                    No hay tables en esta área
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Leyenda */}
                    <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                            Leyenda de Estados:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">Disponible</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">Ocupada</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                <span className="text-sm text-slate-700 dark:text-slate-300">Reservada</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
                            💡 El punto azul indica que hay una order activa en esa table
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}

