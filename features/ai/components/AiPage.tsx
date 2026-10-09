'use client'
import {
    Activity,
    AlertTriangle,
    Brain,
    Database,
    RefreshCw,
    TrendingUp,
} from 'lucide-react'
import {
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataTable,
    EmptyState,
    Skeleton,
} from '@/components/ui'
import type { ColumnDef } from '@tanstack/react-table'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency } from '@/lib/utils/currency'
import {
    useAiHealth,
    useAiMetrics,
    useAnomalies,
    usePeakHours,
    useProductForecast,
    useSalesForecast,
    useTrainModels,
} from '../hooks/useAi'
import type { AnomalyPoint, ProductForecastPoint } from '../api'
import { PeakHoursChart } from './PeakHoursChart'
import { SalesForecastChart } from './SalesForecastChart'

function formatNumber(value: number | null | undefined, digits = 0): string {
    if (value === null || value === undefined) return '—'
    return value.toLocaleString('es-BO', {
        minimumFractionDigits: digits,
        maximumFractionDigits: digits,
    })
}

const productForecastColumns: ColumnDef<ProductForecastPoint>[] = [
    {
        accessorKey: 'product_name',
        header: 'Producto',
        cell: ({ row }) => (
            <>
                <span className="font-medium text-foreground">
                    {row.original.product_name}
                </span>
                {row.original.category_name && (
                    <span className="block text-xs text-muted-foreground">
                        {row.original.category_name}
                    </span>
                )}
            </>
        ),
    },
    {
        id: 'average_daily_quantity',
        header: 'Media/día',
        accessorFn: (row) => row.average_daily_quantity,
        meta: { align: 'right' },
        cell: ({ row }) => formatNumber(row.original.average_daily_quantity, 1),
    },
    {
        id: 'predicted_quantity',
        header: 'Proyectado 7d',
        accessorFn: (row) => row.predicted_quantity,
        meta: { align: 'right' },
        cell: ({ row }) => (
            <span className="font-medium text-foreground">
                {formatNumber(row.original.predicted_quantity, 1)}
            </span>
        ),
    },
]

const anomalyColumns: ColumnDef<AnomalyPoint>[] = [
    { accessorKey: 'date', header: 'Fecha' },
    {
        id: 'value',
        header: 'Ventas',
        accessorFn: (row) => row.value,
        meta: { align: 'right' },
        cell: ({ row }) => formatCurrency(row.original.value),
    },
    {
        id: 'z_score',
        header: 'Z-score',
        accessorFn: (row) => row.z_score,
        meta: { align: 'right' },
        cell: ({ row }) => formatNumber(row.original.z_score, 2),
    },
    {
        id: 'direction',
        header: 'Tendencia',
        enableSorting: false,
        cell: ({ row }) => (
            <Badge
                variant={row.original.direction === 'high' ? 'success' : 'danger'}
            >
                {row.original.direction === 'high'
                    ? 'Por encima'
                    : 'Por debajo'}
            </Badge>
        ),
    },
]

interface StatProps {
    label: string
    value: string
    hint?: string
    icon: React.ReactNode
}

function Stat({ label, value, hint, icon }: StatProps) {
    return (
        <Card>
            <CardContent className="flex items-start gap-3 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-surface-muted text-primary [&_svg]:size-5">
                    {icon}
                </div>
                <div className="space-y-0.5">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <p className="text-xl font-semibold text-foreground">{value}</p>
                    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
                </div>
            </CardContent>
        </Card>
    )
}

export function AiPage() {
    const user = useAuth((state) => state.user)
    const isAdmin = user?.role === 'ADMINISTRATOR'

    const health = useAiHealth()
    const metrics = useAiMetrics()
    const sales = useSalesForecast(7)
    const products = useProductForecast(7, 10)
    const peakHours = usePeakHours()
    const anomalies = useAnomalies()
    const retrain = useTrainModels()

    const summary = metrics.data
    const insufficient =
        summary?.insufficient_data ??
        sales.data?.insufficient_data ??
        false

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                        Inteligencia artificial
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Métricas del modelo, pronósticos y detección de anomalías
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant={health.isSuccess ? 'success' : 'danger'}>
                        {health.isSuccess ? 'Servicio activo' : 'Servicio no disponible'}
                    </Badge>
                    {isAdmin && (
                        <Button
                            onClick={() => retrain.mutate()}
                            disabled={retrain.isPending}
                        >
                            <RefreshCw
                                className={retrain.isPending ? 'animate-spin' : undefined}
                            />
                            Reentrenar
                        </Button>
                    )}
                </div>
            </div>

            {metrics.isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Skeleton key={index} className="h-24 w-full" />
                    ))}
                </div>
            ) : metrics.isError ? (
                <EmptyState
                    icon={<Brain />}
                    title="No se pudieron cargar las métricas de IA"
                    description="El servicio de pronósticos no está disponible. Verifica que maminco-ai esté en ejecución."
                />
            ) : (
                <>
                    {insufficient && (
                        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground">
                            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
                            <span>
                                {summary?.reason ??
                                    'Aún no hay suficiente histórico para entrenar el modelo. Se necesitan ventas cerradas de varios días.'}
                            </span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Stat
                            label="Días de histórico"
                            value={formatNumber(summary?.days)}
                            hint={
                                summary?.last_date
                                    ? `Hasta ${summary.last_date}`
                                    : undefined
                            }
                            icon={<Database />}
                        />
                        <Stat
                            label="Ventas totales"
                            value={formatCurrency(summary?.total_sales)}
                            hint={`${formatNumber(summary?.total_orders)} órdenes`}
                            icon={<TrendingUp />}
                        />
                        <Stat
                            label="Venta diaria media"
                            value={formatCurrency(summary?.average_daily_sales)}
                            hint={`Ticket ${formatCurrency(summary?.average_order_value)}`}
                            icon={<Activity />}
                        />
                        <Stat
                            label="Error del modelo (MAE)"
                            value={formatNumber(summary?.sales_model_mae, 2)}
                            hint={
                                summary?.baseline_mae != null
                                    ? `Baseline ${formatNumber(summary.baseline_mae, 2)} · ${summary.sales_model_chosen ?? '—'}`
                                    : undefined
                            }
                            icon={<Brain />}
                        />
                    </div>

                    <SalesForecastChart forecast={sales.data} loading={sales.isLoading} />

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <PeakHoursChart
                            peakHours={peakHours.data}
                            loading={peakHours.isLoading}
                        />

                        <Card>
                            <CardHeader>
                                <CardTitle>Productos más demandados</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Demanda proyectada a 7 días
                                </p>
                            </CardHeader>
                            <CardContent>
                                {products.isLoading ? (
                                    <Skeleton className="h-64 w-full" />
                                ) : (products.data?.forecast ?? []).length === 0 ? (
                                    <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                                        Sin datos de demanda
                                    </div>
                                ) : (
                                    <DataTable
                                        columns={productForecastColumns}
                                        data={products.data?.forecast ?? []}
                                        getRowId={(item) => item.product_id}
                                    />
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Anomalías detectadas</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Días con ventas fuera de lo esperado
                            </p>
                        </CardHeader>
                        <CardContent>
                            {anomalies.isLoading ? (
                                <Skeleton className="h-32 w-full" />
                            ) : (anomalies.data?.anomalies ?? []).length === 0 ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    No se detectaron anomalías en el histórico reciente.
                                </p>
                                ) : (
                                    <DataTable
                                        columns={anomalyColumns}
                                        data={anomalies.data?.anomalies ?? []}
                                        getRowId={(item) => item.date}
                                    />
                                )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
