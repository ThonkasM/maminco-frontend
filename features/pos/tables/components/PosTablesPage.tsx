'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
    Armchair,
    Building2,
    ClipboardList,
    Cloud,
    LayoutGrid,
    Menu,
    X,
} from 'lucide-react'
import { Badge, Button, EmptyState, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import type { TableResponse } from '@/features/tables/api'
import { useOrderSocket } from '@/features/pos/orders/hooks/useOrderSocket'
import { usePosTables } from '../hooks/usePosTables'
import { usePosTablesUI } from '../hooks/usePosTablesUI'

const STATUS_STYLES: Record<string, string> = {
    AVAILABLE: 'bg-success text-white',
    OCCUPIED: 'bg-danger text-white',
    RESERVED: 'bg-warning text-white',
}

const STATUS_LABELS: Record<string, string> = {
    AVAILABLE: 'Disponible',
    OCCUPIED: 'Ocupada',
    RESERVED: 'Reservada',
}

export function PosTablesPage() {
    const { selectedAreaId, handleSelectArea } = usePosTablesUI()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    const {
        areas,
        tables,
        activeOrders,
        loading,
        setActiveOrder,
        setActiveOrders,
    } = usePosTables()

    useOrderSocket({
        subscribeToTablesStatus: true,
        onTablesStateSnapshot: (data) => {
            if (!Array.isArray(data?.tables)) return
            const states: Record<string, boolean> = {}
            for (const table of data.tables) {
                states[table.id] = Boolean(table.hasActiveOrder)
            }
            setActiveOrders(states)
        },
        onTableStatusChanged: (data) => {
            if (!data?.tableId || !data?.status) return
            setActiveOrder(data.tableId, data.status === 'OCCUPIED')
        },
        onTableStateUpdated: (data) => {
            if (!data?.tableId || !data?.orderState) return
            setActiveOrder(data.tableId, data.orderState.status === 'DRAFT')
        },
    })

    const activeAreaId = selectedAreaId || areas[0]?.id || null

    const { physicalAreas, virtualAreas } = useMemo(() => {
        return {
            physicalAreas: areas.filter((area) => !area.isVirtual),
            virtualAreas: areas.filter((area) => area.isVirtual),
        }
    }, [areas])

    const getTableStatus = (table: TableResponse): string => {
        if (activeOrders[table.id]) return 'OCCUPIED'
        return table.status
    }

    const getAreaStats = (areaId: string) => {
        const areaTables = tables.filter((table) => table.areaId === areaId)
        const occupied = areaTables.filter((table) => activeOrders[table.id]).length
        return {
            total: areaTables.length,
            occupied,
            available: areaTables.length - occupied,
        }
    }

    const filteredTables = activeAreaId
        ? tables.filter((table) => table.areaId === activeAreaId)
        : tables

    if (loading) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-background p-6">
                <div className="w-full max-w-md space-y-3">
                    <Skeleton className="h-10 w-1/2" />
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full overflow-hidden bg-background">
            <aside
                className={cn(
                    'fixed left-0 top-0 z-30 h-full overflow-y-auto border-r border-border bg-surface transition-transform duration-300 md:static md:translate-x-0',
                    sidebarOpen
                        ? 'w-64 translate-x-0'
                        : '-translate-x-full md:w-64',
                )}
            >
                <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface p-4 md:hidden">
                    <h3 className="font-bold text-foreground">Áreas</h3>
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Cerrar panel de áreas"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X />
                    </Button>
                </div>

                <div className="p-4">
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Building2 className="size-4" />
                        <span>Áreas físicas</span>
                    </div>
                    <div className="mb-6 space-y-2">
                        {physicalAreas.map((area) => {
                            const stats = getAreaStats(area.id)
                            const isSelected = activeAreaId === area.id
                            return (
                                <Button
                                    key={area.id}
                                    variant={isSelected ? 'primary' : 'secondary'}
                                    onClick={() => {
                                        handleSelectArea(area.id)
                                        setSidebarOpen(false)
                                    }}
                                    className="h-auto w-full flex-col items-start justify-start gap-0 p-4 text-left"
                                >
                                    <span className="text-sm font-semibold">
                                        {area.name}
                                    </span>
                                    <span
                                        className={cn(
                                            'mt-1 text-xs font-normal',
                                            isSelected
                                                ? 'text-primary-foreground/80'
                                                : 'text-muted-foreground',
                                        )}
                                    >
                                        {stats.available} libre
                                        {stats.available !== 1 ? 's' : ''} /{' '}
                                        {stats.total} mesas
                                    </span>
                                    {stats.occupied > 0 && (
                                        <span
                                            className={cn(
                                                'mt-1 text-xs font-semibold',
                                                isSelected
                                                    ? 'text-primary-foreground/90'
                                                    : 'text-danger',
                                            )}
                                        >
                                            {stats.occupied} ocupada
                                            {stats.occupied !== 1 ? 's' : ''}
                                        </span>
                                    )}
                                </Button>
                            )
                        })}
                    </div>

                    {virtualAreas.length > 0 && (
                        <div className="my-4 h-px bg-border" />
                    )}

                    {virtualAreas.length > 0 && (
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                <Cloud className="size-4" />
                                <span>Servicios especiales</span>
                            </div>
                            <div className="space-y-2">
                                {virtualAreas.map((area) => {
                                    const isSelected = activeAreaId === area.id
                                    return (
                                        <Button
                                            key={area.id}
                                            variant={isSelected ? 'accent' : 'secondary'}
                                            onClick={() => {
                                                handleSelectArea(area.id)
                                                setSidebarOpen(false)
                                            }}
                                            className="h-auto w-full flex-col items-start justify-start gap-0 p-4 text-left"
                                        >
                                            <span className="text-sm font-semibold">
                                                {area.name}
                                            </span>
                                            <span
                                                className={cn(
                                                    'mt-1 text-xs font-normal',
                                                    isSelected
                                                        ? 'text-accent-foreground/80'
                                                        : 'text-muted-foreground',
                                                )}
                                            >
                                                Servicio virtual
                                            </span>
                                        </Button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </aside>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex flex-1 flex-col overflow-auto">
                <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-border bg-surface px-4 py-3 md:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Abrir panel de áreas"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu />
                    </Button>
                    <span className="text-sm font-semibold text-foreground">
                        {areas.find((area) => area.id === activeAreaId)?.name ||
                            'Selecciona un área'}
                    </span>
                </div>

                <div className="p-6">
                    <div className="mb-8">
                        <h1 className="mb-2 text-3xl font-bold text-foreground">
                            Centro de órdenes
                        </h1>
                        <p className="text-muted-foreground">
                            Selecciona una mesa para crear o continuar con una orden
                        </p>
                    </div>

                    {activeAreaId && (
                        <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
                            <p className="text-sm text-foreground">
                                Mostrando {filteredTables.length} mesa
                                {filteredTables.length !== 1 ? 's' : ''} en esta área
                            </p>
                        </div>
                    )}

                    <div>
                        <h2 className="mb-4 text-xl font-bold text-foreground">
                            Mesas
                        </h2>
                        {filteredTables.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                {filteredTables.map((table) => {
                                    const status = getTableStatus(table)
                                    return (
                                        <Link
                                            key={table.id}
                                            href={`/pos/orders/${table.id}`}
                                            className="group"
                                        >
                                            <div
                                                className={cn(
                                                    'relative flex aspect-square w-full transform cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg text-center font-bold text-white shadow-elevated transition-all duration-300 hover:scale-105',
                                                    STATUS_STYLES[status] ||
                                                        'bg-muted-foreground',
                                                )}
                                            >
                                                {activeOrders[table.id] && (
                                                    <div className="absolute right-2 top-2 rounded-full bg-white/25 p-1">
                                                        <ClipboardList className="size-3.5" />
                                                    </div>
                                                )}

                                                <Armchair className="mb-2 size-10" />
                                                <div className="text-xl font-bold">
                                                    Mesa {table.number}
                                                </div>
                                                <div className="mt-1 text-sm opacity-90">
                                                    {STATUS_LABELS[status] || status}
                                                </div>

                                                <div className="absolute inset-0 flex items-end justify-center bg-black/20 pb-3 opacity-0 transition-all group-hover:opacity-100">
                                                    <span className="text-sm font-semibold">
                                                        {activeOrders[table.id]
                                                            ? 'Continuar orden'
                                                            : 'Nueva orden'}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                icon={<LayoutGrid />}
                                title="No hay mesas en esta área"
                                description="Crea mesas en el panel de gestión para este salón."
                            />
                        )}
                    </div>

                    <div className="mt-8 rounded-lg border border-border bg-surface-muted p-4">
                        <p className="mb-3 text-sm font-semibold text-foreground">
                            Leyenda de estados
                        </p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                            <div className="flex items-center gap-2">
                                <span className="size-4 rounded bg-success" />
                                <span className="text-sm text-foreground">
                                    Disponible
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-4 rounded bg-danger" />
                                <span className="text-sm text-foreground">
                                    Ocupada
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="size-4 rounded bg-warning" />
                                <span className="text-sm text-foreground">
                                    Reservada
                                </span>
                            </div>
                        </div>
                        <div className="mt-3 flex items-center gap-2">
                            <Badge variant="info">
                                <ClipboardList className="size-3.5" />
                                Orden activa
                            </Badge>
                            <p className="text-xs text-muted-foreground">
                                El ícono indica que hay una orden activa en esa mesa
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PosTablesPage
