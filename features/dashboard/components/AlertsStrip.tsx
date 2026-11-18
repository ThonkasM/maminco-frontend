'use client'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getAlerts } from '@/features/insights/api'

export function AlertsStrip() {
    const alerts = useQuery({
        queryKey: ['insights', 'alerts'],
        queryFn: ({ signal }) => getAlerts(false, signal),
        refetchInterval: 15_000,
        retry: false,
    })

    if (alerts.isLoading || alerts.isError || !alerts.data) return null
    const items = alerts.data.alerts.filter((alert) => alert.severity !== 'info').slice(0, 3)

    if (items.length === 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2.5 text-sm text-foreground">
                <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                Sin alertas relevantes: la operación y las ventas están dentro de lo esperado.
            </div>
        )
    }

    return (
        <div className="rounded-lg border border-warning/40 bg-warning/10 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
                    {items.length} alerta{items.length === 1 ? '' : 's'} que requieren atención
                </p>
                <Link href="/insights" className="inline-flex items-center gap-1 text-xs font-medium text-primary-ink hover:underline">
                    Ver monitoreo <ArrowRight className="size-3" />
                </Link>
            </div>
            <ul className="space-y-1 text-sm">
                {items.map((alert) => (
                    <li key={alert.id} className="flex flex-wrap gap-x-2">
                        <span className={cn('font-semibold', alert.severity === 'critical' ? 'text-danger' : 'text-warning')}>
                            {alert.title}
                        </span>
                        <span className="text-muted-foreground">{alert.detail}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
