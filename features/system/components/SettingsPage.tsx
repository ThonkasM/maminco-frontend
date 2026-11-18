'use client'
import { useState } from 'react'
import {
    Activity,
    Brain,
    Database,
    Printer,
    RefreshCw,
    Search,
    Server,
    Trash2,
    Wifi,
} from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    Input,
    Select,
    Skeleton,
} from '@/components/ui'
import type { ColumnDef } from '@tanstack/react-table'
import type { LogEntry, LogLevel, ServiceHealth } from '../api'
import {
    usePruneSystemLogs,
    useSystemConfig,
    useSystemLogs,
    useSystemLogStats,
    useSystemStatus,
} from '../hooks/useSystem'

function formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const parts = []
    if (days) parts.push(`${days}d`)
    if (hours || days) parts.push(`${hours}h`)
    parts.push(`${minutes}m`)
    return parts.join(' ')
}

function StatusBadge({ reachable, label }: { reachable: boolean; label?: string }) {
    return (
        <Badge variant={reachable ? 'success' : 'danger'}>
            {label ?? (reachable ? 'Conectado' : 'Sin conexión')}
        </Badge>
    )
}

interface HealthCardProps {
    icon: React.ReactNode
    title: string
    health: ServiceHealth
    rows: Array<{ label: string; value: string }>
}

function HealthCard({ icon, title, health, rows }: HealthCardProps) {
    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
                    {title}
                </CardTitle>
                <StatusBadge reachable={health.reachable} />
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
                {rows.map((row) => (
                    <div key={row.label} className="flex justify-between gap-4 text-sm">
                        <span className="text-muted-foreground">{row.label}</span>
                        <span className="text-right font-medium text-foreground">
                            {row.value}
                        </span>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

const LEVEL_VARIANT: Record<LogLevel, 'neutral' | 'danger' | 'warning' | 'info'> = {
    error: 'danger',
    fatal: 'danger',
    warn: 'warning',
    log: 'neutral',
    debug: 'info',
    verbose: 'info',
}

const logColumns: ColumnDef<LogEntry>[] = [
    {
        id: 'timestamp',
        header: 'Hora',
        accessorFn: (row) => row.timestamp,
        meta: { headerClassName: 'w-40' },
        cell: ({ row }) => (
            <span className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                {new Date(row.original.timestamp).toLocaleTimeString('es-BO')}
            </span>
        ),
    },
    {
        id: 'level',
        header: 'Nivel',
        enableSorting: false,
        meta: { headerClassName: 'w-28' },
        cell: ({ row }) => (
            <Badge variant={LEVEL_VARIANT[row.original.level]}>
                {row.original.level}
            </Badge>
        ),
    },
    {
        id: 'context',
        header: 'Contexto',
        accessorFn: (row) => row.context ?? '',
        meta: { headerClassName: 'w-40' },
        cell: ({ row }) => (
            <span className="text-xs text-muted-foreground">
                {row.original.context ?? '—'}
            </span>
        ),
    },
    {
        id: 'message',
        header: 'Mensaje',
        accessorFn: (row) => row.message,
        cell: ({ row }) => (
            <span className="font-mono text-xs">{row.original.message}</span>
        ),
    },
]

export function SystemPanel() {
    const [level, setLevel] = useState<'' | LogLevel>('')
    const [search, setSearch] = useState('')
    const status = useSystemStatus()
    const config = useSystemConfig()
    const stats = useSystemLogStats()
    const logs = useSystemLogs(150, level || undefined, search || undefined)
    const prune = usePruneSystemLogs()

    return (
        <div className="space-y-6">
            {status.isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton key={index} className="h-40 w-full" />
                    ))}
                </div>
            ) : status.data ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <HealthCard
                        icon={<Server />}
                        title="Servidor"
                        health={{ reachable: status.data.server.status === 'ok' }}
                        rows={[
                            { label: 'Uptime', value: formatUptime(status.data.server.uptimeSeconds) },
                            { label: 'Node', value: status.data.server.nodeVersion },
                            { label: 'Entorno', value: status.data.server.environment },
                            { label: 'Memoria RSS', value: `${status.data.server.memory.rssMb} MB` },
                        ]}
                    />
                    <HealthCard
                        icon={<Database />}
                        title="Base de datos"
                        health={status.data.database}
                        rows={[
                            {
                                label: 'Latencia',
                                value:
                                    status.data.database.latencyMs != null
                                        ? `${status.data.database.latencyMs} ms`
                                        : '—',
                            },
                        ]}
                    />
                    <HealthCard
                        icon={<Brain />}
                        title="Servicio de IA"
                        health={status.data.ai}
                        rows={[
                            { label: 'URL', value: status.data.ai.url ?? '—' },
                        ]}
                    />
                    <HealthCard
                        icon={<Printer />}
                        title="Impresora"
                        health={status.data.printing}
                        rows={[
                            {
                                label: 'Predeterminada',
                                value: status.data.printing.detail?.defaultPrinter ?? '—',
                            },
                            {
                                label: 'Total',
                                value: String(
                                    status.data.printing.detail?.printers.length ?? 0,
                                ),
                            },
                        ]}
                    />
                    <HealthCard
                        icon={<Wifi />}
                        title="Clientes en tiempo real"
                        health={{ reachable: true }}
                        rows={[
                            {
                                label: 'Conectados',
                                value: String(status.data.realtime.clients),
                            },
                        ]}
                    />
                    <HealthCard
                        icon={<Activity />}
                        title="Configuración"
                        health={{ reachable: true }}
                        rows={[
                            {
                                label: 'Puerto',
                                value: String(config.data?.port ?? '—'),
                            },
                            { label: 'API', value: config.data?.apiBasePath ?? '/api' },
                            {
                                label: 'IA habilitada',
                                value: config.data?.aiEnabled ? 'Sí' : 'No',
                            },
                        ]}
                    />
                </div>
            ) : (
                <Card>
                    <CardContent className="py-8 text-center text-sm text-muted-foreground">
                        No se pudo obtener el estado del sistema.
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <CardTitle>Registros del servidor</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Persistidos en la base de datos · retención{' '}
                                {stats.data?.retentionDays ?? 3} días ·{' '}
                                {stats.data
                                    ? `${new Intl.NumberFormat('es-BO').format(stats.data.count)} registros`
                                    : '—'}{' '}
                                (máx. {stats.data?.maxRows?.toLocaleString('es-BO') ?? '—'})
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={search}
                                    placeholder="Buscar mensaje..."
                                    className="w-56 pl-9"
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            <Select
                                value={level}
                                onChange={(e) => setLevel(e.target.value as LogLevel | '')}
                                className="w-40"
                            >
                                <option value="">Todos los niveles</option>
                                <option value="error">Errores</option>
                                <option value="warn">Advertencias</option>
                                <option value="log">Información</option>
                                <option value="debug">Debug</option>
                            </Select>
                            <Button
                                variant="secondary"
                                size="icon"
                                onClick={() => logs.refetch()}
                                aria-label="Actualizar registros"
                            >
                                <RefreshCw
                                    className={logs.isFetching ? 'animate-spin' : undefined}
                                />
                            </Button>
                            <Button
                                variant="danger"
                                onClick={() => prune.mutate()}
                                disabled={prune.isPending}
                            >
                                <Trash2 />
                                Limpiar ahora
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {logs.isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : (logs.data?.data ?? []).length === 0 ? (
                        <p className="py-8 text-center text-sm text-muted-foreground">
                            No hay registros para mostrar.
                        </p>
                    ) : (
                        <DataTable
                            columns={logColumns}
                            data={logs.data?.data ?? []}
                            enableSorting={false}
                            getRowId={(entry) => `${entry.timestamp}-${entry.message}`}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
