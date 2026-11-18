import type { Metadata } from 'next'
import { PublicMenu } from '@/features/menu/components/PublicMenu'
import type { PublicMenuData } from '@/features/menu/api'
import { API_BASE } from '@/lib/http/client'

export const revalidate = 30

export const metadata: Metadata = {
    title: 'Carta',
    description: 'Mira la carta de Maminco con los platos disponibles hoy y sus precios.',
}

async function loadMenu(): Promise<PublicMenuData | null> {
    try {
        const response = await fetch(new URL('/api/public/menu', API_BASE), { next: { revalidate: 30 } })
        if (!response.ok) return null
        return (await response.json()) as PublicMenuData
    } catch {
        return null
    }
}

export default async function PublicMenuPage() {
    const menu = await loadMenu()
    if (!menu) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center text-muted-foreground">
                <p>No pudimos cargar la carta en este momento. Intenta de nuevo en unos minutos.</p>
            </main>
        )
    }
    return <PublicMenu menu={menu} />
}
