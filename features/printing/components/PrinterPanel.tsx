'use client'
import { useCallback, useEffect, useState } from 'react'
import { Printer, PlugZap, Unplug } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Spinner } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import {
    describeUsbError,
    forgetPrinter,
    getAuthorizedPrinter,
    isWebUsbSupported,
    printerLabel,
    requestPrinter,
} from '@/lib/printing/webusb'
import { printTestTicket } from '../usb-print'

export function PrinterPanel() {
    const [supported, setSupported] = useState<boolean | null>(null)
    const [label, setLabel] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    const refresh = useCallback(async () => {
        const ok = isWebUsbSupported()
        setSupported(ok)
        if (!ok) return
        try {
            const device = await getAuthorizedPrinter()
            setLabel(device ? printerLabel(device) : null)
        } catch {
            setLabel(null)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => void refresh(), 0)
        return () => clearTimeout(timer)
    }, [refresh])

    const connect = async () => {
        setBusy(true)
        try {
            const device = await requestPrinter()
            setLabel(printerLabel(device))
            toast.success('Impresora conectada')
        } catch (error) {
            if (error instanceof Error && error.name === 'NotFoundError') return
            toast.error(describeUsbError(error))
        } finally {
            setBusy(false)
        }
    }

    const disconnect = () => {
        forgetPrinter()
        setLabel(null)
        toast.success('Impresora olvidada en este navegador')
    }

    const test = async () => {
        setBusy(true)
        try {
            const result = await printTestTicket()
            if (result.success) toast.success(result.message)
            else toast.error(result.message)
        } catch (error) {
            toast.error(describeUsbError(error))
        } finally {
            setBusy(false)
        }
    }

    return (
        <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Printer className="size-4 text-muted-foreground" />
                    Impresora de tickets
                </CardTitle>
                {supported === false ? (
                    <Badge variant="danger">Navegador no compatible</Badge>
                ) : (
                    <Badge variant={label ? 'success' : 'warning'}>{label ? 'Conectada' : 'Sin conectar'}</Badge>
                )}
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-sm">
                {supported === false ? (
                    <p className="text-muted-foreground">
                        Este navegador no permite conectar impresoras USB. Abre el sistema con Google Chrome o Microsoft
                        Edge en el equipo donde está conectada la impresora.
                    </p>
                ) : (
                    <>
                        <p className="text-muted-foreground">
                            La impresión se hace desde este navegador, directamente por USB. Conecta la impresora a este
                            equipo, enciéndela y pulsa «Conectar impresora» para autorizarla. Solo hace falta una vez por
                            navegador.
                        </p>
                        {label && (
                            <div className="flex justify-between gap-4">
                                <span className="text-muted-foreground">Dispositivo</span>
                                <span className="font-medium text-foreground">{label}</span>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button onClick={connect} disabled={busy}>
                                {busy ? <Spinner /> : <PlugZap />}
                                {label ? 'Cambiar impresora' : 'Conectar impresora'}
                            </Button>
                            <Button variant="secondary" onClick={test} disabled={busy || !label}>
                                <Printer />
                                Imprimir prueba
                            </Button>
                            {label && (
                                <Button variant="ghost" onClick={disconnect} disabled={busy}>
                                    <Unplug />
                                    Olvidar
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
