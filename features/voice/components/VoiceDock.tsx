'use client'
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, Check, Loader2, Mic, MicOff, Send, X } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { useFeatureFlag } from '@/features/flags/hooks/useFlags'
import { getErrorMessage } from '@/lib/utils/errors'
import { useSpeechDictation } from '@/lib/voice/useSpeechDictation'
import { cn } from '@/lib/utils/cn'
import { confirmVoiceCommand, sendVoiceCommand, type VoiceResult } from '@/features/insights/api'

export const VOICE_FLAG = 'voice_interaction'
const AUTO_SEND_SECONDS = 2

interface VoiceDockProps {
    tableNumber?: number
    areaId?: string
}

export function VoiceDock({ tableNumber, areaId }: VoiceDockProps) {
    const { enabled } = useFeatureFlag(VOICE_FLAG)
    const queryClient = useQueryClient()
    const [open, setOpen] = useState(false)
    const [text, setText] = useState('')
    const [busy, setBusy] = useState(false)
    const [result, setResult] = useState<VoiceResult | null>(null)
    const [countdown, setCountdown] = useState<number | null>(null)
    const timer = useRef<ReturnType<typeof setInterval> | null>(null)

    const apply = useCallback(
        (response: VoiceResult) => {
            setResult(response)
            if (response.actions.some((action) => action.ok)) {
                void queryClient.invalidateQueries()
            }
            if (response.status === 'done') toast.success(response.message)
            if (response.status === 'error') toast.error(response.message)
        },
        [queryClient],
    )

    const send = useCallback(
        async (command: string) => {
            const transcript = command.trim()
            if (transcript.length < 2) return
            setBusy(true)
            setResult(null)
            try {
                apply(await sendVoiceCommand({ transcript, tableNumber, areaId }))
                setText('')
            } catch (error) {
                toast.error(getErrorMessage(error, 'No se pudo ejecutar el comando.'))
            } finally {
                setBusy(false)
            }
        },
        [apply, areaId, tableNumber],
    )

    const clearTimer = useCallback(() => {
        if (timer.current) clearInterval(timer.current)
        timer.current = null
        setCountdown(null)
    }, [])

    const dictation = useSpeechDictation(
        useCallback(
            (spoken: string) => {
                setText(spoken)
                let remaining = AUTO_SEND_SECONDS
                setCountdown(remaining)
                timer.current = setInterval(() => {
                    remaining -= 1
                    if (remaining <= 0) {
                        clearTimer()
                        void send(spoken)
                    } else setCountdown(remaining)
                }, 1000)
            },
            [clearTimer, send],
        ),
    )

    useEffect(() => clearTimer, [clearTimer])

    useEffect(() => {
        if (!enabled) return undefined
        const onKey = (event: KeyboardEvent) => {
            if (event.altKey && event.key.toLowerCase() === 'v') {
                event.preventDefault()
                setOpen(true)
                if (dictation.status === 'listening') dictation.stop()
                else dictation.start()
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [enabled, dictation])

    if (!enabled) return null

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        clearTimer()
        void send(text)
    }

    const confirm = async (token: string) => {
        setBusy(true)
        try {
            apply(await confirmVoiceCommand(token))
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo confirmar.'))
        } finally {
            setBusy(false)
        }
    }

    const listening = dictation.status === 'listening'
    const context = tableNumber !== undefined ? `Mesa ${tableNumber}` : 'Di el número de mesa en la orden'

    return (
        <div className="fixed bottom-5 right-5 z-30 flex flex-col items-end gap-3">
            {open && (
                <div
                    role="dialog"
                    aria-label="Interacción por voz"
                    className="w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-surface shadow-float"
                >
                    <div className="flex items-center justify-between border-b-[3px] border-brand-leaf bg-nav px-4 py-3 text-nav-foreground">
                        <div>
                            <p className="text-sm font-semibold">Voz · experimental</p>
                            <p className="text-xs text-nav-foreground/70">{context}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                clearTimer()
                                dictation.cancel()
                                setOpen(false)
                            }}
                            aria-label="Cerrar panel de voz"
                            className="rounded-md p-1 hover:bg-nav-foreground/10"
                        >
                            <X className="size-4" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="space-y-3 p-4">
                        <p className="text-xs text-muted-foreground">
                            Ejemplo: «Abre la mesa 4 y coloca 2 patos criollos y 1 gaseosa familiar». También puedes
                            decir «aumenta», «baja», «cambia a» o «quita».
                        </p>

                        <div className="flex items-center gap-3">
                            <Button
                                type="button"
                                variant={listening ? 'danger' : 'primary'}
                                onClick={() => {
                                    clearTimer()
                                    if (listening) dictation.stop()
                                    else dictation.start()
                                }}
                                disabled={!dictation.supported || busy}
                                aria-pressed={listening}
                            >
                                {listening ? <MicOff /> : <Mic />}
                                {listening ? 'Detener' : 'Hablar'}
                            </Button>
                            <p className="min-h-5 flex-1 text-xs text-muted-foreground" aria-live="polite">
                                {!dictation.supported
                                    ? 'Tu navegador no admite voz; escribe el comando.'
                                    : listening
                                      ? dictation.interim || 'Escuchando…'
                                      : (dictation.error ?? '')}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <Input
                                value={text}
                                onChange={(event) => {
                                    clearTimer()
                                    setText(event.target.value)
                                }}
                                placeholder="Escribe o dicta un comando"
                                aria-label="Comando de voz"
                                disabled={busy}
                            />
                            <Button type="submit" size="icon" aria-label="Enviar comando" disabled={busy || text.trim().length < 2}>
                                {busy ? <Loader2 className="animate-spin" /> : <Send />}
                            </Button>
                        </form>

                        {countdown !== null && (
                            <p className="flex items-center justify-between text-xs text-muted-foreground">
                                Enviando en {countdown} s…
                                <button type="button" onClick={clearTimer} className="font-medium text-foreground underline">
                                    Cancelar
                                </button>
                            </p>
                        )}

                        {result && (
                            <div
                                className={cn(
                                    'space-y-2 rounded-md border p-3 text-sm',
                                    result.status === 'error' && 'border-danger-fill/60 bg-danger-fill/10',
                                    result.status === 'done' && 'border-success-fill/50 bg-success-fill/10',
                                    (result.status === 'clarify' || result.status === 'needs_confirmation') &&
                                        'border-warning-fill/50 bg-warning-fill/10',
                                )}
                            >
                                <p className="text-foreground">{result.message}</p>
                                {result.actions.length > 0 && (
                                    <ul className="space-y-1 text-xs text-muted-foreground">
                                        {result.actions.map((action, index) => (
                                            <li key={index} className="flex items-start gap-1.5">
                                                {action.ok ? (
                                                    <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                                                ) : (
                                                    <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden="true" />
                                                )}
                                                {action.summary}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                {result.confirmation && (
                                    <div className="flex gap-2 pt-1">
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            disabled={busy}
                                            onClick={() => void confirm(result.confirmation!.token)}
                                        >
                                            Confirmar
                                        </Button>
                                        <Button size="sm" variant="outline" disabled={busy} onClick={() => setResult(null)}>
                                            Cancelar
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Button
                type="button"
                shape="pill"
                size="lg"
                onClick={() => setOpen((value) => !value)}
                aria-expanded={open}
                aria-label={open ? 'Cerrar voz' : 'Abrir interacción por voz (Alt+V)'}
                className="bg-gradient-to-r from-brand-yellow to-brand-orange font-semibold text-brand-ink shadow-float hover:brightness-110"
            >
                <Mic />
                <span className="hidden sm:inline">Voz</span>
            </Button>
        </div>
    )
}
