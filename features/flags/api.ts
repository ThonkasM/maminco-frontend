import { apiFetch } from '@/lib/http/client'

export interface FeatureFlag {
    id: string
    key: string
    name: string
    description?: string | null
    enabled: boolean
    createdAt: string
    updatedAt: string
}

export function getFeatureFlags(signal?: AbortSignal): Promise<FeatureFlag[]> {
    return apiFetch('/api/features', { signal })
}

export function updateFeatureFlag(
    key: string,
    enabled: boolean,
): Promise<FeatureFlag> {
    return apiFetch(`/api/features/${key}`, {
        method: 'PATCH',
        body: { enabled },
    })
}
