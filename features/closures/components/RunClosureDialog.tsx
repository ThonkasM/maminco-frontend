'use client'
import { useState } from 'react'
import { AlertTriangle, FileCheck2, Loader2 } from 'lucide-react'
import { Button, Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { getErrorMessage } from '@/lib/utils/errors'
import { closureBlock, formatBusinessDate, type ClosureBlock, type ClosureSummary } from '../api'
import { useRunClosure } from '../hooks'

interface RunClosureDialogProps {
    date: string | null
    /** True when the business day has not ended yet (manual closure from Settings). */
    early?: boolean
    onClose: () => void
    onDone?: (closure: ClosureSummary) => void
}

/** Two-step confirmation: explains what closing implies, and asks again when the server finds a risk. */
export function RunClosureDialog({ date, early = false, onClose, onDone }: RunClosureDialogProps) {
    const run = useRunClosure()
    const [block, setBlock] = useState<ClosureBlock | null>(null)
    const [understood, setUnderstood] = useState(false)
    const [sawOpenOrders, setSawOpenOrders] = useState(false)
    const [sawEarly, setSawEarly] = useState(false)

    const reset = () => {
        setBlock(null)
        setUnderstood(false)
        setSawOpenOrders(false)
        setSawEarly(false)
    }

    const submit = (acknowledgeEarly: boolean, acknowledgeOpenOrders: boolean) => {
        if (!date) return
        run.mutate(
            { date, acknowledgeEarly, acknowledgeOpenOrders },
            {
                onSuccess: (closure) => {
                    toast.success('El reporte quedó guardado en el Repositorio.', 'Cierre de día generado')
                    reset()
                    onDone?.(closure)
                    onClose()
                },
                onError: (error) => {
                    const found = closureBlock(error)
                    if (found) {
                        setBlock(found)
                        setUnderstood(false)
                        if (found.code === 'OPEN_ORDERS') setSawOpenOrders(true)
                        else setSawEarly(true)
                    }
                    else toast.error(getErrorMessage(error, 'No se pudo generar el cierre.'), 'Cierre fallido')
                },
            },
        )
    }

    const needsEarlyAck = early || sawEarly

    return (
        <Dialog
            open={Boolean(date)}
            onOpenChange={(open) => {
                if (!open && !run.isPending) {
                    reset()
                    onClose()
                }
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader className="items-center text-center">
                    <span className={`mb-1 flex size-12 items-center justify-center rounded-full ${needsEarlyAck || block ? 'bg-warning/15 text-warning' : 'bg-primary/15 text-primary-ink'}`}>
                        {needsEarlyAck || block ? <AlertTriangle className="size-6" aria-hidden="true" /> : <FileCheck2 className="size-6" aria-hidden="true" />}
                    </span>
                    <DialogTitle>Correr cierre de día</DialogTitle>
                    <DialogDescription>{date ? `Se generará el reporte de caja del ${formatBusinessDate(date)}.` : ''}</DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-sm text-foreground">
                    <p className="text-muted-foreground">
                        El cierre resume ventas, métodos de pago, turnos y productos, y guarda un PDF en <strong className="text-foreground">Repositorio › Cierres de caja</strong>.
                    </p>

                    {needsEarlyAck && (
                        <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                            <p className="font-semibold">Este día todavía no termina</p>
                            <ul className="mt-1 list-disc space-y-1 pl-5 text-muted-foreground">
                                <li>El reporte solo incluirá lo vendido hasta este momento y se marcará como «cierre anticipado».</li>
                                <li>Las ventas posteriores no entrarán, salvo que vuelvas a correr el cierre (se reemplaza el PDF).</li>
                                <li>Un cierre fuera de hora puede confundir al equipo de caja y a tus reportes mensuales.</li>
                            </ul>
                        </div>
                    )}

                    {block?.code === 'OPEN_ORDERS' && (
                        <div className="rounded-lg border border-danger/40 bg-danger/10 p-3">
                            <p className="font-semibold">Hay {block.openOrders} orden{block.openOrders === 1 ? '' : 'es'} abierta{block.openOrders === 1 ? '' : 's'}</p>
                            <p className="mt-1 text-muted-foreground">
                                No se cobraron todavía, así que no sumarán a las ventas del día. Lo ideal es cobrarlas o cancelarlas antes de cerrar.
                            </p>
                        </div>
                    )}

                    {(needsEarlyAck || block) && (
                        <label className="flex cursor-pointer items-start gap-2 rounded-md p-1 text-sm">
                            <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} />
                            <span>Entiendo las consecuencias y quiero continuar.</span>
                        </label>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="secondary" disabled={run.isPending} onClick={() => { reset(); onClose() }}>
                        Cancelar
                    </Button>
                    <Button
                        variant={needsEarlyAck || block ? 'danger' : 'primary'}
                        disabled={run.isPending || ((needsEarlyAck || Boolean(block)) && !understood)}
                        onClick={() => submit(needsEarlyAck && (understood || !block), sawOpenOrders && understood)}
                    >
                        {run.isPending ? <Loader2 className="animate-spin" /> : null}
                        {run.isPending ? 'Generando…' : block || needsEarlyAck ? 'Correr cierre igualmente' : 'Correr cierre'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
