'use client'
import Link from 'next/link'
import { ArrowRight, Brain } from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Skeleton,
} from '@/components/ui'
import { formatCurrency } from '@/lib/utils/currency'
import { useSalesForecast } from '../hooks/useAi'

export function AiForecastTeaser() {
    const forecast = useSalesForecast(7)
    const points = forecast.data?.forecast ?? []
    const next = points[0]
    const total = points.reduce((sum, point) => sum + point.predicted_sales, 0)
    const insufficient = forecast.data?.insufficient_data

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2">
                    <Brain className="size-5 text-primary" />
                    Pronóstico de IA
                </CardTitle>
                {forecast.data?.chosen && (
                    <Badge variant="info">{forecast.data.chosen}</Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {forecast.isLoading ? (
                    <Skeleton className="h-24 w-full" />
                ) : insufficient || points.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {forecast.data?.reason ??
                            'Aún no hay suficiente histórico para generar pronósticos.'}
                    </p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Próximo día
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {formatCurrency(next?.predicted_sales)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {next?.date} · {next?.weekday}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Total 7 días
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                                {formatCurrency(total)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {points.length} días proyectados
                            </p>
                        </div>
                    </div>
                )}

                <Link href="/ai">
                    <Button variant="secondary" size="sm">
                        Ver métricas de IA
                        <ArrowRight />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}
