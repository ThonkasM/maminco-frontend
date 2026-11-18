'use client'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { DonutChart } from '@/components/charts'
import type { BreakdownItem } from '../api'

interface CompositionCardsProps {
    payment: BreakdownItem[]
    category: BreakdownItem[]
    shift?: BreakdownItem[]
    loading: boolean
}

function CompositionCard({ title, subtitle, items, loading, exportId }: { title: string; subtitle: string; items: BreakdownItem[]; loading: boolean; exportId: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-44 w-full" />
                ) : (
                    <DonutChart
                        stacked
                        exportId={exportId}
                        ariaLabel={title}
                        height={180}
                        data={items.map((item) => ({ label: item.label, value: item.totalSales }))}
                    />
                )}
            </CardContent>
        </Card>
    )
}

export function CompositionCards({ payment, category, shift = [], loading }: CompositionCardsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <CompositionCard title="Cómo pagan" subtitle="Participación de cada método de pago en la venta" items={payment} loading={loading} exportId="reports-payment" />
            <CompositionCard title="Qué se vende" subtitle="Participación de cada categoría en la venta" items={category} loading={loading} exportId="reports-category" />
            <CompositionCard title="Por turno" subtitle="Qué turno vendió más" items={shift} loading={loading} exportId="reports-shift" />
        </div>
    )
}
