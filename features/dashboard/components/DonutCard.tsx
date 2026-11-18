'use client'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { DonutChart } from '@/components/charts'
import type { BreakdownItem } from '@/features/reports/api'

interface DonutCardProps {
    title: string
    subtitle?: string
    items: BreakdownItem[]
    loading?: boolean
    exportId: string
}

export function DonutCard({ title, subtitle, items, loading, exportId }: DonutCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-44 w-full" />
                ) : (
                    <DonutChart
                        exportId={exportId}
                        ariaLabel={title}
                        height={180}
                        stacked
                        data={items.map((item) => ({ label: item.label, value: item.totalSales }))}
                    />
                )}
            </CardContent>
        </Card>
    )
}
