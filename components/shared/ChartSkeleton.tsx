import { Skeleton } from '@/components/ui/Skeleton'

export function ChartSkeleton({ height = 340 }: { height?: number }) {
    return (
        <div
            className="rounded-xl border border-border bg-surface p-5"
            style={{ minHeight: height }}
            role="status"
            aria-label="Cargando gráfico"
        >
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-6 w-full" style={{ height: height - 90 }} />
        </div>
    )
}
