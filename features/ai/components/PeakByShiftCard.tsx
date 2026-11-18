'use client'
import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { DonutChart } from '@/components/charts'
import { useShiftConfig } from '@/features/shifts/hooks'
import { shiftOfHour } from '@/features/shifts/lib'
import type { PeakHours } from '../api'

/** Groups the model's hourly demand profile by the configured shifts. */
export function PeakByShiftCard({ peakHours, loading }: { peakHours: PeakHours | undefined; loading?: boolean }) {
    const config = useShiftConfig()
    const data = useMemo(() => {
        if (!peakHours || !config.data) return []
        const totals = new Map<string, number>()
        for (const point of peakHours.profile) {
            const shift = shiftOfHour(config.data.shifts, point.hour)
            if (shift) totals.set(shift.name, (totals.get(shift.name) ?? 0) + point.avg_orders)
        }
        return [...totals.entries()].map(([label, value]) => ({ label, value }))
    }, [peakHours, config.data])

    return (
        <Card>
            <CardHeader>
                <CardTitle>Demanda esperada por turno</CardTitle>
                <p className="text-sm text-muted-foreground">Órdenes promedio por día repartidas entre tus turnos</p>
            </CardHeader>
            <CardContent>
                {loading || config.isLoading ? (
                    <Skeleton className="h-48 w-full" />
                ) : (
                    <DonutChart stacked ariaLabel="Demanda esperada por turno" format="decimal" centerLabel="Órdenes/día" height={180} data={data} />
                )}
            </CardContent>
        </Card>
    )
}
