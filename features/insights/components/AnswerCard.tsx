'use client'
import { useState } from 'react'
import { ChevronDown, Table2 } from 'lucide-react'
import { Card, CardContent, Skeleton } from '@/components/ui'
import { ExportButton } from '@/features/export/components/ExportButton'
import { buildInsightsExport } from '../export'
import type { AskResult } from '../api'
import { ChartView } from './ChartView'
import { DatasetTable } from './DatasetTable'

export interface ThreadEntry {
    id: number
    question: string
    result?: AskResult
    error?: string
}

interface AnswerCardProps {
    entry: ThreadEntry
    onFollowUp: (question: string) => void
}

export function AnswerCard({ entry, onFollowUp }: AnswerCardProps) {
    const [showData, setShowData] = useState(false)
    const { result } = entry

    return (
        <div className="space-y-3">
            <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-menu-green px-4 py-2 text-sm text-white">
                    {entry.question}
                </p>
            </div>

            <Card>
                <CardContent className="space-y-5 pt-6">
                    {!result && !entry.error && (
                        <div className="space-y-3" aria-live="polite">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-40 w-full" />
                        </div>
                    )}

                    {entry.error && (
                        <p className="text-sm text-danger" role="alert">
                            {entry.error}
                        </p>
                    )}

                    {result && (
                        <>
                            <p className="text-pretty leading-relaxed text-foreground">{result.answer}</p>

                            {result.charts.length > 0 && (
                                <div
                                    className={`grid gap-6 ${result.charts.length > 1 ? 'xl:grid-cols-2' : ''}`}
                                >
                                    {result.charts.map((chart) => (
                                        <figure key={chart.id} className="min-w-0">
                                            <figcaption className="mb-2 text-sm font-semibold text-foreground">
                                                {chart.title}
                                            </figcaption>
                                            <div data-export-chart={`insights-${entry.id}-${chart.id}`}>
                                                <ChartView spec={chart} />
                                            </div>
                                            {chart.note && (
                                                <p className="mt-1 text-xs text-muted-foreground">{chart.note}</p>
                                            )}
                                        </figure>
                                    ))}
                                </div>
                            )}

                            {result.datasets.length > 0 && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setShowData((value) => !value)}
                                        aria-expanded={showData}
                                        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink hover:underline"
                                    >
                                        <Table2 className="size-4" aria-hidden="true" />
                                        {showData ? 'Ocultar datos' : 'Ver datos'}
                                        <ChevronDown
                                            className={`size-4 transition-transform ${showData ? 'rotate-180' : ''}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                    {showData && (
                                        <div className="mt-3 space-y-4">
                                            {result.datasets.map((dataset) => (
                                                <div key={dataset.id}>
                                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                        {dataset.title}
                                                    </p>
                                                    <DatasetTable dataset={dataset} />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {result.followUps.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {result.followUps.map((followUp) => (
                                        <button
                                            key={followUp}
                                            type="button"
                                            onClick={() => onFollowUp(followUp)}
                                            className="rounded-full border border-menu-green/50 px-3 py-1 text-xs text-primary-ink transition-colors hover:bg-menu-green/15 hover:text-foreground"
                                        >
                                            {followUp}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                            <p className="text-xs text-muted-foreground">
                                {result.range.label} · {result.toolsUsed.length} consulta
                                {result.toolsUsed.length === 1 ? '' : 's'} · {result.ms} ms · motor{' '}
                                {result.engine.model}
                            </p>
                            <ExportButton
                                size="sm"
                                variant="ghost"
                                label="Exportar respuesta"
                                build={() => buildInsightsExport([entry], undefined, { single: true })}
                            />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
