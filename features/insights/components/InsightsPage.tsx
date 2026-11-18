'use client'
import { FormEvent, useCallback, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Mic, Send, Sparkles, Square } from 'lucide-react'
import { Badge, Button, Card, CardContent, Input } from '@/components/ui'
import { getErrorMessage } from '@/lib/utils/errors'
import { useSpeechDictation } from '@/lib/voice/useSpeechDictation'
import { cn } from '@/lib/utils/cn'
import { ExportButton } from '@/features/export/components/ExportButton'
import { askInsights, getEngines, type MonitoringReport } from '../api'
import { buildInsightsExport } from '../export'
import { AlertsPanel } from './AlertsPanel'
import { AnswerCard, type ThreadEntry } from './AnswerCard'

const SUGGESTIONS = [
    '¿Cómo van las ventas de esta semana?',
    'Compara este mes con el mes pasado',
    '¿Cuáles son los 5 productos más vendidos?',
    '¿A qué horas y qué días vendo más?',
    '¿Qué método de pago domina este mes?',
    '¿Cuántas mesas hay ocupadas ahora?',
]

export function InsightsPage() {
    const [question, setQuestion] = useState('')
    const [thread, setThread] = useState<ThreadEntry[]>([])
    const queryClient = useQueryClient()
    const nextId = useRef(1)
    const busy = thread.some((entry) => !entry.result && !entry.error)

    const engines = useQuery({
        queryKey: ['insights', 'engines'],
        queryFn: ({ signal }) => getEngines(signal),
        staleTime: 30_000,
    })

    const submit = useCallback(async (text: string) => {
        const trimmed = text.trim()
        if (trimmed.length < 3) return
        const id = nextId.current++
        setThread((previous) => [{ id, question: trimmed }, ...previous])
        setQuestion('')
        try {
            const result = await askInsights({ question: trimmed })
            setThread((previous) =>
                previous.map((entry) => (entry.id === id ? { ...entry, result } : entry)),
            )
        } catch (error) {
            setThread((previous) =>
                previous.map((entry) =>
                    entry.id === id
                        ? { ...entry, error: getErrorMessage(error, 'No se pudo responder la consulta.') }
                        : entry,
                ),
            )
        }
    }, [])

    const dictation = useSpeechDictation(
        useCallback(
            (spoken: string) => {
                setQuestion(spoken)
                void submit(spoken)
            },
            [submit],
        ),
    )
    const listening = dictation.status === 'listening'

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()
        void submit(question)
    }

    const active = engines.data?.active

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">
                        Insights
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Pregunta en lenguaje natural y obtén respuesta, gráficas y datos. Los agentes
                        consultan tus reportes mediante MCP.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <ExportButton
                        label="Exportar informe"
                        build={() =>
                            buildInsightsExport(thread, queryClient.getQueryData<MonitoringReport>(['insights', 'alerts']))
                        }
                    />
                {active && (
                    <Badge variant={active.external ? 'brand' : 'neutral'} title="Motor que redacta las respuestas">
                        <Sparkles className="mr-1 size-3" aria-hidden="true" />
                        {active.label}
                    </Badge>
                )}
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
                <section className="space-y-5" aria-label="Consulta de reportes">
                    <Card>
                        <CardContent className="space-y-4 pt-6">
                            <form onSubmit={handleSubmit} className="flex items-center gap-2">
                                <Input
                                    value={listening ? dictation.interim : question}
                                    onChange={(event) => setQuestion(event.target.value)}
                                    readOnly={listening}
                                    placeholder={
                                        listening
                                            ? 'Escuchando… haz tu pregunta'
                                            : 'Ej.: ¿Cuánto vendí la semana pasada y cómo se compara con la anterior?'
                                    }
                                    aria-label="Pregunta sobre tus ventas"
                                    maxLength={500}
                                />
                                {dictation.supported && (
                                    <Button
                                        type="button"
                                        variant={listening ? 'danger' : 'secondary'}
                                        onClick={listening ? dictation.stop : dictation.start}
                                        disabled={busy && !listening}
                                        aria-pressed={listening}
                                        aria-label={listening ? 'Detener dictado' : 'Dictar pregunta por voz'}
                                        title={listening ? 'Detener' : 'Dictar por voz'}
                                        className={cn(listening && 'animate-pulse')}
                                    >
                                        {listening ? <Square /> : <Mic />}
                                    </Button>
                                )}
                                <Button type="submit" disabled={busy || question.trim().length < 3}>
                                    <Send />
                                    Preguntar
                                </Button>
                            </form>
                            {dictation.error && (
                                <p role="alert" className="text-sm text-danger">
                                    {dictation.error}
                                </p>
                            )}
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTIONS.map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        disabled={busy}
                                        onClick={() => void submit(suggestion)}
                                        className="rounded-full border border-border bg-surface-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-menu-green/50 hover:text-foreground disabled:opacity-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {thread.length === 0 && (
                        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                            Aún no hay consultas. Elige una sugerencia o escribe tu pregunta.
                        </p>
                    )}

                    {thread.map((entry) => (
                        <AnswerCard key={entry.id} entry={entry} onFollowUp={(text) => void submit(text)} />
                    ))}
                </section>

                <aside aria-label="Monitoreo">
                    <AlertsPanel />
                </aside>
            </div>
        </div>
    )
}
