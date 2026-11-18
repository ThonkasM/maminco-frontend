import { apiFetch } from '@/lib/http/client'

export interface MenuProduct {
    id: string
    name: string
    description: string | null
    price: number
    isAvailable: boolean
    image: { thumb: string; large: string } | null
}

export interface MenuSection {
    id: string
    name: string
    description: string | null
    products: MenuProduct[]
}

export interface AdminMenu {
    sections: MenuSection[]
    note: string | null
    totals: { products: number; available: number }
}

export interface PublicMenuData {
    restaurant: string
    generatedAt: string
    note: string | null
    sections: MenuSection[]
}

export const getAdminMenu = (signal?: AbortSignal) => apiFetch<AdminMenu>('/api/menu/admin', { signal })
export const setAvailability = (body: { productIds: string[]; isAvailable: boolean }) =>
    apiFetch<{ updated: number }>('/api/menu/availability', { method: 'PATCH', body })
export const updateMenuNote = (note: string | null) =>
    apiFetch<{ note: string | null }>('/api/menu/note', { method: 'PUT', body: { note } })
