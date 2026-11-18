'use client'
import { ToggleRight } from 'lucide-react'
import {
    Badge,
    Card,
    CardContent,
    EmptyState,
    Skeleton,
    Switch,
} from '@/components/ui'
import { useFeatureFlags, useUpdateFeatureFlag } from '../hooks/useFlags'

export function FlagsPage() {
    const flags = useFeatureFlags()
    const update = useUpdateFeatureFlag()

    const pendingKey = update.isPending ? update.variables?.key : undefined

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                    Feature flags
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Activa o desactiva funcionalidades del sistema. Los cambios
                    aplican al POS web y móvil.
                </p>
            </div>

            {flags.isLoading ? (
                <div className="space-y-3">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : flags.isError ? (
                <EmptyState
                    icon={<ToggleRight />}
                    title="No se pudieron cargar los flags"
                    description="Verifica la conexión con el servidor."
                />
            ) : (flags.data ?? []).length === 0 ? (
                <EmptyState
                    icon={<ToggleRight />}
                    title="Sin feature flags"
                    description="Aún no hay funcionalidades configurables."
                />
            ) : (
                <div className="space-y-3">
                    {flags.data?.map((flag) => (
                        <Card key={flag.key}>
                            <CardContent className="flex items-start justify-between gap-4 p-5">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-medium text-foreground">
                                            {flag.name}
                                        </p>
                                        <Badge
                                            variant={
                                                flag.enabled
                                                    ? 'success'
                                                    : 'neutral'
                                            }
                                        >
                                            {flag.enabled ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </div>
                                    {flag.description && (
                                        <p className="text-sm text-muted-foreground">
                                            {flag.description}
                                        </p>
                                    )}
                                    <p className="font-mono text-xs text-muted-foreground">
                                        {flag.key}
                                    </p>
                                </div>
                                <Switch
                                    checked={flag.enabled}
                                    disabled={pendingKey === flag.key}
                                    aria-label={`Alternar ${flag.name}`}
                                    onCheckedChange={(enabled) =>
                                        update.mutate({
                                            key: flag.key,
                                            enabled,
                                        })
                                    }
                                />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
