'use client'
import { useMemo, useState } from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils/cn'
import { useAuth } from '@/hooks/useAuth'
import { useShiftConfig, useUpdateShiftConfig } from '../hooks'
import { DAY_MINUTES, shiftLength, toMinutes, validateShifts, type ShiftDraft } from '../lib'

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)']

function Timeline({ shifts }: { shifts: ShiftDraft[] }) {
    return (
        <div>
            <div className="relative h-9 overflow-hidden rounded-lg border border-border bg-surface-muted" role="img" aria-label="Los turnos sobre las 24 horas del día">
                {shifts.map((shift, index) => {
                    const start = toMinutes(shift.start)
                    const length = shiftLength(shift)
                    if (start === null || length === null) return null
                    const segments = start + length > DAY_MINUTES ? [[start, DAY_MINUTES], [0, start + length - DAY_MINUTES]] : [[start, start + length]]
                    return segments.map(([from, to]) => (
                        <div
                            key={`${index}-${from}`}
                            className="absolute inset-y-0 flex items-center justify-center overflow-hidden px-2 text-xs font-semibold text-brand-charcoal"
                            style={{ left: `${(from / DAY_MINUTES) * 100}%`, width: `${((to - from) / DAY_MINUTES) * 100}%`, background: COLORS[index % COLORS.length] }}
                        >
                            <span className="truncate">{shift.name}</span>
                        </div>
                    ))
                })}
            </div>
            <div className="mt-1 flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
                {['00', '06', '12', '18', '24'].map((hour) => (
                    <span key={hour}>{hour}h</span>
                ))}
            </div>
        </div>
    )
}

const TIME_ZONE_LABELS: Record<string, string> = { 'America/La_Paz': 'Hora de Bolivia (La Paz, UTC−4)' }

function TimeZoneCard({ timeZone }: { timeZone: string }) {
    const now = new Intl.DateTimeFormat('es-BO', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())
    return (
        <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zona horaria del negocio</p>
                    <p className="mt-0.5 font-medium text-foreground">{TIME_ZONE_LABELS[timeZone] ?? timeZone}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                        Los turnos, el día de negocio y los reportes usan esta hora. Se define al desplegar el sistema (variable <code>REPORT_TIMEZONE</code>).
                    </p>
                </div>
                <span className="rounded-full border border-border bg-surface-muted px-3 py-1 text-sm tabular-nums text-foreground">Ahora: {now}</span>
            </CardContent>
        </Card>
    )
}

export function ShiftsPanel() {
    const config = useShiftConfig()
    const update = useUpdateShiftConfig()
    const role = useAuth((state) => state.user?.role)
    const canEdit = role === 'ADMINISTRATOR'
    const [draft, setDraft] = useState<{ businessDayStart: string; shifts: ShiftDraft[] } | null>(null)

    const current = draft ?? (config.data ? { businessDayStart: config.data.businessDayStart, shifts: config.data.shifts } : null)
    const error = useMemo(() => (current ? validateShifts(current.shifts) : null), [current])
    const dirty = draft !== null

    if (config.isLoading || !current) return <Skeleton className="h-64 w-full" />

    const edit = (next: { businessDayStart?: string; shifts?: ShiftDraft[] }) => setDraft({ businessDayStart: next.businessDayStart ?? current.businessDayStart, shifts: next.shifts ?? current.shifts })
    const setShift = (index: number, patch: Partial<ShiftDraft>) => edit({ shifts: current.shifts.map((shift, i) => (i === index ? { ...shift, ...patch } : shift)) })

    return (
        <div className="space-y-6">
            <TimeZoneCard timeZone={config.data?.timeZone ?? 'America/La_Paz'} />

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="size-5 text-muted-foreground" aria-hidden="true" />
                        Turnos de trabajo
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Los turnos dividen el día para los reportes: filtros, gráficos de ventas por turno y respuestas de Insights. Deben cubrir las 24 horas sin
                        superponerse; un turno puede pasar de medianoche (por ejemplo 18:00 a 06:00).
                        {!canEdit && ' Solo un administrador puede cambiarlos.'}
                    </p>
                </CardHeader>
                <CardContent className="space-y-5">
                    <Timeline shifts={current.shifts} />

                    <ul className="space-y-3">
                        {current.shifts.map((shift, index) => (
                            <li key={shift.id ?? index} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-[1fr_8rem_8rem_auto] sm:items-end">
                                <FormField label="Nombre">
                                    <Input value={shift.name} disabled={!canEdit} maxLength={30} onChange={(event) => setShift(index, { name: event.target.value })} />
                                </FormField>
                                <FormField label="Inicio">
                                    <Input type="time" value={shift.start} disabled={!canEdit} onChange={(event) => setShift(index, { start: event.target.value })} />
                                </FormField>
                                <FormField label="Fin">
                                    <Input type="time" value={shift.end} disabled={!canEdit} onChange={(event) => setShift(index, { end: event.target.value })} />
                                </FormField>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    disabled={!canEdit || current.shifts.length <= 1}
                                    aria-label={`Quitar turno ${shift.name}`}
                                    onClick={() => edit({ shifts: current.shifts.filter((_, i) => i !== index) })}
                                >
                                    <Trash2 />
                                </Button>
                            </li>
                        ))}
                    </ul>

                    {canEdit && (
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            disabled={current.shifts.length >= 5}
                            onClick={() => edit({ shifts: [...current.shifts, { name: `Turno ${current.shifts.length + 1}`, start: '00:00', end: '00:00' }] })}
                        >
                            <Plus />
                            Agregar turno
                        </Button>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Inicio del día de negocio</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Las ventas hechas antes de esta hora cuentan para el día anterior. Sirve cuando el local cierra pasada la medianoche: con 04:00, una venta a
                        la 01:30 del martes pertenece al lunes. Déjalo en 00:00 para usar días calendario.
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="max-w-40">
                        <FormField label="Hora de inicio">
                            <Input type="time" value={current.businessDayStart} disabled={!canEdit} onChange={(event) => edit({ businessDayStart: event.target.value })} />
                        </FormField>
                    </div>
                </CardContent>
            </Card>

            {canEdit && (
                <div className="flex flex-wrap items-center gap-3">
                    <Button
                        disabled={!dirty || Boolean(error) || update.isPending}
                        onClick={() =>
                            update.mutate(
                                {
                                    businessDayStart: current.businessDayStart,
                                    shifts: current.shifts.map((shift) => ({ name: shift.name.trim(), start: shift.start, end: shift.end })),
                                },
                                { onSuccess: () => setDraft(null) },
                            )
                        }
                    >
                        {update.isPending ? 'Guardando…' : 'Guardar turnos'}
                    </Button>
                    {dirty && (
                        <Button variant="ghost" onClick={() => setDraft(null)}>
                            Descartar cambios
                        </Button>
                    )}
                    {error && <p role="alert" className={cn('text-sm', dirty ? 'text-danger' : 'text-muted-foreground')}>{error}</p>}
                </div>
            )}
        </div>
    )
}
