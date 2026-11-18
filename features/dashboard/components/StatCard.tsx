'use client'
import type { LucideIcon } from 'lucide-react'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'

interface StatCardProps {
    label: string
    value: string
    icon: LucideIcon
    detail?: string
    delta?: number | null
    /** When true a decrease is good news (e.g. discounts). */
    inverse?: boolean
    deltaHint?: string
    loading?: boolean
    tone?: 'default' | 'warning' | 'danger'
}

export function StatCard({ label, value, icon: Icon, detail, delta, inverse, deltaHint, loading, tone = 'default' }: StatCardProps) {
    if (loading) return <Skeleton className="h-28 w-full" />
    const up = (delta ?? 0) >= 0
    const good = inverse ? !up : up
    const DeltaIcon = up ? TrendingUp : TrendingDown
    return (
        <Card>
            <CardContent className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <span
                        className={cn(
                            'flex size-9 items-center justify-center rounded-lg bg-surface-muted',
                            tone === 'warning' && 'bg-warning/15 text-warning',
                            tone === 'danger' && 'bg-danger/15 text-danger',
                            tone === 'default' && 'text-primary-ink',
                        )}
                    >
                        <Icon className="size-4" aria-hidden="true" />
                    </span>
                    {delta !== null && delta !== undefined && (
                        <span
                            title={deltaHint}
                            className={cn(
                                'inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                                delta === 0
                                    ? 'bg-surface-muted text-muted-foreground'
                                    : good
                                      ? 'bg-success-fill/15 text-success'
                                      : 'bg-danger-fill/15 text-danger',
                            )}
                        >
                            <DeltaIcon className="size-3" aria-hidden="true" />
                            {up ? '+' : ''}
                            {delta.toLocaleString('es-BO', { maximumFractionDigits: 1 })} %
                        </span>
                    )}
                </div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
                <p className="mt-1 text-xl font-bold text-foreground">{value}</p>
                {detail && <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>}
            </CardContent>
        </Card>
    )
}
