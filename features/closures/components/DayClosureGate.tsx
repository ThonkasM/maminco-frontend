'use client'
import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { formatBusinessDate } from '../api'
import { useClosureStatus } from '../hooks'
import { RunClosureDialog } from './RunClosureDialog'

/** Blocks the admin panel for managers until every finished business day has been closed. */
export function DayClosureGate() {
    const role = useAuth((state) => state.user?.role)
    const allowed = role === 'ADMINISTRATOR' || role === 'MANAGER'
    const status = useClosureStatus(allowed)
    const [running, setRunning] = useState(false)

    const pending = status.data?.pending ?? []
    if (!allowed || pending.length === 0) return null
    const oldest = pending[0]

    return (
        <>
            <Dialog open>
                <DialogContent
                    className="max-w-md [&>button[aria-label=Cerrar]]:hidden"
                    onInteractOutside={(event) => event.preventDefault()}
                    onEscapeKeyDown={(event) => event.preventDefault()}
                >
                    <DialogHeader className="items-center text-center">
                        <span className="mb-1 flex size-12 items-center justify-center rounded-full bg-warning/15 text-warning">
                            <CalendarClock className="size-6" aria-hidden="true" />
                        </span>
                        <DialogTitle>Falta cerrar el día</DialogTitle>
                        <DialogDescription>
                            {pending.length === 1
                                ? `El ${formatBusinessDate(oldest)} terminó y todavía no tiene cierre de caja.`
                                : `Hay ${pending.length} días terminados sin cierre de caja. Empieza por el más antiguo: ${formatBusinessDate(oldest)}.`}
                        </DialogDescription>
                    </DialogHeader>
                    <p className="text-center text-sm text-muted-foreground">
                        El cierre genera el reporte general en PDF y lo guarda en el Repositorio. Debes correrlo para continuar.
                    </p>
                    <Button className="w-full" onClick={() => setRunning(true)}>
                        Correr cierre de día
                    </Button>
                </DialogContent>
            </Dialog>
            <RunClosureDialog key={oldest} date={running ? oldest : null} onClose={() => setRunning(false)} />
        </>
    )
}
