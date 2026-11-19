'use client'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CalendarCheck, Clock, Printer, Server } from 'lucide-react'
import { Button, Skeleton } from '@/components/ui'
import { ClosurePanel } from '@/features/closures/components/ClosurePanel'
import { ShiftsPanel } from '@/features/shifts/components/ShiftsPanel'
import { PrinterPanel } from '@/features/printing/components/PrinterPanel'
import { SystemPanel } from '@/features/system/components/SettingsPage'

const TABS = [
    { id: 'shifts', label: 'Turnos', icon: Clock },
    { id: 'closure', label: 'Cierre de día', icon: CalendarCheck },
    { id: 'printer', label: 'Impresora', icon: Printer },
    { id: 'system', label: 'Sistema', icon: Server },
] as const

type TabId = (typeof TABS)[number]['id']

function SettingsTabs() {
    const router = useRouter()
    const params = useSearchParams()
    const requested = params.get('tab')
    const active: TabId = TABS.some((tab) => tab.id === requested) ? (requested as TabId) : 'shifts'

    return (
        <div className="space-y-6">
            <div>
                <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Configuración</h2>
                <p className="mt-1 text-sm text-muted-foreground">Turnos de trabajo, cierre de día, impresora y estado del sistema.</p>
            </div>

            <div role="tablist" aria-label="Secciones de configuración" className="flex flex-wrap gap-2 border-b border-border pb-3">
                {TABS.map((tab) => {
                    const Icon = tab.icon
                    return (
                        <Button
                            key={tab.id}
                            role="tab"
                            aria-selected={active === tab.id}
                            variant={active === tab.id ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => router.replace(`/settings?tab=${tab.id}`, { scroll: false })}
                        >
                            <Icon />
                            {tab.label}
                        </Button>
                    )
                })}
            </div>

            <div role="tabpanel">
                {active === 'shifts' && <ShiftsPanel />}
                {active === 'closure' && <ClosurePanel />}
                {active === 'printer' && <PrinterPanel />}
                {active === 'system' && <SystemPanel />}
            </div>
        </div>
    )
}

export function SettingsPage() {
    return (
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <SettingsTabs />
        </Suspense>
    )
}
