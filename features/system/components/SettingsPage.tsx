'use client'
import { useState } from 'react'
import {
    Activity,
    Brain,
    Database,
    Printer,
    RefreshCw,
    Server,
    Wifi,
} from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select,
    Skeleton,
    Table,
    TableWrapper,
    TBody,
    Td,
    Th,
    THead,
    Tr,
} from '@/components/ui'
import type { LogLevel, ServiceHealth } from '../api'
import { useSystemConfig, useSystemLogs, useSystemStatus } from '../hooks/useSystem'

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

export function SettingsPage() {
    const [level, setLevel] = useState<'' | LogLevel>('')
    const status = useSystemStatus()
    const config = useSystemConfig()
    const logs = useSystemLogs(150, level || undefined)

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    Configuración del sistema
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Estado de servicios, configuración y registros del servidor
                </p>
            </div>

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
                <CardHeader className="flex-row items-center justify-between gap-4">
                    <div>
                        <CardTitle>Registros del servidor</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Últimos eventos registrados en memoria
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
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
                            <RefreshCw className={logs.isFetching ? 'animate-spin' : undefined} />
                        </Button>
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
                        <TableWrapper>
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th className="w-40">Hora</Th>
                                        <Th className="w-28">Nivel</Th>
                                        <Th className="w-40">Contexto</Th>
                                        <Th>Mensaje</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {logs.data?.data.map((entry, index) => (
                                        <Tr key={`${entry.timestamp}-${index}`}>
                                            <Td className="whitespace-nowrap font-mono text-xs text-muted-foreground">
                                                {new Date(entry.timestamp).toLocaleTimeString(
                                                    'es-BO',
                                                )}
                                            </Td>
                                            <Td>
                                                <Badge variant={LEVEL_VARIANT[entry.level]}>
                                                    {entry.level}
                                                </Badge>
                                            </Td>
                                            <Td className="text-xs text-muted-foreground">
                                                {entry.context ?? '—'}
                                            </Td>
                                            <Td className="font-mono text-xs">
                                                {entry.message}
                                            </Td>
                                        </Tr>
                                    ))}
                                </TBody>
                            </Table>
                        </TableWrapper>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
