'use client'
import { AlertTriangle, CheckCircle2, Info, RefreshCw, ShieldAlert } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { getAlerts, type AlertSeverity } from '../api'

const STYLE: Record<AlertSeverity, { icon: typeof Info; tone: string; label: string }> = {
    critical: { icon: ShieldAlert, tone: 'border-danger-fill/60 bg-danger-fill/10 text-danger', label: 'Crítica' },
    warning: { icon: AlertTriangle, tone: 'border-warning-fill/60 bg-warning-fill/10 text-warning', label: 'Atención' },
    info: { icon: Info, tone: 'border-border bg-surface-muted text-muted-foreground', label: 'Info' },
}

const KEY = ['insights', 'alerts'] as const

export function AlertsPanel() {
    const queryClient = useQueryClient()
    const [refreshing, setRefreshing] = useState(false)
    const query = useQuery({
        queryKey: KEY,
        queryFn: ({ signal }) => getAlerts(false, signal),
        refetchInterval: 15_000,
    })

    const refresh = async () => {
        setRefreshing(true)
        try {
            queryClient.setQueryData(KEY, await getAlerts(true))
        } finally {
            setRefreshing(false)
        }
    }

    const report = query.data
    const time = report
        ? new Date(report.generatedAt).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
        : ''

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <ShieldAlert className="size-5 text-muted-foreground" aria-hidden="true" />
                    Monitoreo
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={refresh} disabled={refreshing} aria-label="Actualizar alertas">
                    <RefreshCw className={cn(refreshing && 'animate-spin')} />
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {query.isLoading && (
                    <div className="space-y-2">
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                    </div>
                )}
                {query.isError && (
                    <p className="text-sm text-danger" role="alert">
                        No se pudieron cargar las alertas.
                    </p>
                )}
                {report && (
                    <>
                        <p className="text-sm text-foreground">{report.summary}</p>
                        {report.alerts.length === 0 && (
                            <div className="flex items-center gap-2 rounded-md border border-border bg-surface-muted p-3 text-sm text-muted-foreground">
                                <CheckCircle2 className="size-4 text-tone-leaf" aria-hidden="true" />
                                Sin alertas por ahora.
                            </div>
                        )}
                        <ul className="space-y-2">
                            {report.alerts.map((alert) => {
                                const { icon: Icon, tone, label } = STYLE[alert.severity]
                                return (
                                    <li key={alert.id} className={cn('rounded-md border p-3', tone)}>
                                        <p className="flex items-center gap-2 text-sm font-semibold">
                                            <Icon className="size-4 shrink-0" aria-hidden="true" />
                                            <span className="text-foreground">{alert.title}</span>
                                            <span className="ml-auto text-[10px] font-semibold uppercase tracking-wide">{label}</span>
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">{alert.detail}</p>
                                    </li>
                                )
                            })}
                        </ul>
                        <p className="text-xs text-muted-foreground">
                            Actualizado a las {time} · reglas locales{report.engine.id === 'local' ? '' : ` + ${report.engine.model}`}
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
