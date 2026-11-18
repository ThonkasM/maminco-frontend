'use client'
import { useMemo, useState } from 'react'
import {
    BarChart3,
    ChevronDown,
    FileJson,
    FileSpreadsheet,
    FileText,
    Flame,
    Gauge,
    Loader2,
    ScrollText,
    Table2,
    type LucideIcon,
} from 'lucide-react'
import {
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui'
import { toast } from '@/components/shared/ToastProvider'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils/cn'
import { getErrorMessage } from '@/lib/utils/errors'
import type { ExportDefinition, ExportFormat, ExportOptions, ExportSection } from '../model'
import { formatCell } from '../lib/format'
import { chartAvailable } from '../lib/rasterize'
import { FORMAT_INFO, runExport } from '../lib/run'
import { defaultOptions } from '../lib/select'

const FORMAT_ICONS: Record<ExportFormat, LucideIcon> = {
    pdf: FileText,
    xlsx: FileSpreadsheet,
    csv: Table2,
    json: FileJson,
}

const KIND_ICONS: Record<ExportSection['kind'], LucideIcon> = {
    summary: ScrollText,
    kpis: Gauge,
    chart: BarChart3,
    heatmap: Flame,
    table: Table2,
}

const KIND_LABELS: Record<ExportSection['kind'], string> = {
    summary: 'Resumen ejecutivo',
    kpis: 'Indicadores',
    chart: 'Gráfico',
    heatmap: 'Mapa de calor',
    table: 'Tabla',
}

function supports(section: ExportSection, format: ExportFormat): boolean {
    if (section.kind === 'chart') return FORMAT_INFO[format].charts
    if (section.kind === 'summary') return format !== 'csv'
    return true
}

interface ExportDialogProps {
    definition: ExportDefinition
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function ExportDialog({ definition, open, onOpenChange }: ExportDialogProps) {
    const user = useAuth((state) => state.user)
    const [options, setOptions] = useState<ExportOptions>(() => defaultOptions(definition))
    const [busy, setBusy] = useState(false)
    const [expanded, setExpanded] = useState<string | null>(null)

    const sections = useMemo(
        () =>
            definition.sections.map((section) => ({
                section,
                unavailable: section.kind === 'chart' && !chartAvailable(section.selector),
            })),
        // Re-evaluated every time the dialog opens so charts that finished loading are detected.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [definition, open],
    )

    const chosen = new Set(options.sections)
    const visible = sections.filter(({ section }) => supports(section, options.format))
    const active = visible.filter(({ section, unavailable }) => chosen.has(section.id) && !unavailable)

    const tableStats = active.reduce(
        (acc, { section }) => {
            if (section.kind === 'table') {
                acc.tables += 1
                acc.rows += options.rows[section.id]?.length ?? 0
            }
            return acc
        },
        { tables: 0, rows: 0 },
    )
    const chartCount = active.filter(({ section }) => section.kind === 'chart').length

    const toggleSection = (id: string) =>
        setOptions((current) => ({
            ...current,
            sections: current.sections.includes(id)
                ? current.sections.filter((item) => item !== id)
                : [...current.sections, id],
        }))

    const toggleColumn = (id: string, key: string) =>
        setOptions((current) => {
            const list = current.columns[id] ?? []
            return {
                ...current,
                columns: {
                    ...current.columns,
                    [id]: list.includes(key) ? list.filter((item) => item !== key) : [...list, key],
                },
            }
        })

    const setRows = (id: string, rows: number[]) =>
        setOptions((current) => ({ ...current, rows: { ...current.rows, [id]: rows } }))

    const toggleRow = (id: string, index: number) => {
        const list = options.rows[id] ?? []
        setRows(id, list.includes(index) ? list.filter((item) => item !== index) : [...list, index].sort((a, b) => a - b))
    }

    const generate = async () => {
        setBusy(true)
        try {
            await runExport(definition, options, user?.name ?? 'Usuario')
            toast.success(`Tu reporte en ${FORMAT_INFO[options.format].label} se descargó.`, 'Reporte generado')
            onOpenChange(false)
        } catch (error) {
            toast.error(getErrorMessage(error, 'No se pudo generar el reporte.'), 'Exportación fallida')
        } finally {
            setBusy(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
            <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 p-0">
                <DialogHeader className="border-b border-border p-6 pr-12">
                    <DialogTitle>Exportar reporte</DialogTitle>
                    <DialogDescription>
                        Elige el formato y arma el contenido: secciones, gráficos, columnas y filas.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    <fieldset>
                        <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Formato
                        </legend>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {(Object.keys(FORMAT_INFO) as ExportFormat[]).map((format) => {
                                const Icon = FORMAT_ICONS[format]
                                const selected = options.format === format
                                return (
                                    <label
                                        key={format}
                                        className={cn(
                                            'flex cursor-pointer flex-col gap-1 rounded-lg border p-3 transition-colors focus-within:ring-2 focus-within:ring-ring',
                                            selected
                                                ? 'border-primary bg-primary/10'
                                                : 'border-border hover:bg-surface-muted',
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="export-format"
                                            className="sr-only"
                                            checked={selected}
                                            onChange={() => setOptions((current) => ({ ...current, format }))}
                                        />
                                        <Icon className={cn('size-5', selected ? 'text-primary-ink' : 'text-muted-foreground')} />
                                        <span className="text-sm font-semibold text-foreground">
                                            {FORMAT_INFO[format].label}
                                        </span>
                                    </label>
                                )
                            })}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{FORMAT_INFO[options.format].description}</p>

                        {options.format === 'pdf' && (
                            <div className="mt-3 flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Orientación</span>
                                {(['portrait', 'landscape'] as const).map((value) => (
                                    <Button
                                        key={value}
                                        size="sm"
                                        variant={options.orientation === value ? 'primary' : 'ghost'}
                                        onClick={() => setOptions((current) => ({ ...current, orientation: value }))}
                                    >
                                        {value === 'portrait' ? 'Vertical' : 'Horizontal'}
                                    </Button>
                                ))}
                            </div>
                        )}
                        {options.format === 'csv' && (
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Separadores</span>
                                {(
                                    [
                                        ['es', 'Excel en español (; y coma decimal)'],
                                        ['standard', 'Estándar (, y punto decimal)'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <Button
                                        key={value}
                                        size="sm"
                                        variant={options.csvStyle === value ? 'primary' : 'ghost'}
                                        onClick={() => setOptions((current) => ({ ...current, csvStyle: value }))}
                                    >
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        )}
                    </fieldset>

                    <fieldset>
                        <legend className="mb-2 flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <span>Contenido</span>
                            <span className="flex gap-1">
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                        setOptions((current) => ({
                                            ...current,
                                            sections: definition.sections.map((section) => section.id),
                                        }))
                                    }
                                >
                                    Todo
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setOptions((current) => ({ ...current, sections: [] }))}
                                >
                                    Nada
                                </Button>
                            </span>
                        </legend>
                        <ul className="space-y-2">
                            {visible.map(({ section, unavailable }) => {
                                const Icon = KIND_ICONS[section.kind]
                                const checked = chosen.has(section.id) && !unavailable
                                const isTable = section.kind === 'table'
                                const open = isTable && expanded === section.id
                                return (
                                    <li key={section.id} className="rounded-lg border border-border bg-surface">
                                        <div className="flex items-center gap-3 p-3">
                                            <input
                                                type="checkbox"
                                                className="size-4 accent-[var(--primary)]"
                                                checked={checked}
                                                disabled={unavailable}
                                                onChange={() => toggleSection(section.id)}
                                                aria-label={`Incluir ${section.title}`}
                                            />
                                            <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-foreground">{section.title}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {KIND_LABELS[section.kind]}
                                                    {isTable &&
                                                        ` · ${options.columns[section.id]?.length ?? 0}/${section.table.columns.length} columnas · ${options.rows[section.id]?.length ?? 0}/${section.table.rows.length} filas`}
                                                    {unavailable && ' · no disponible (aún cargando o sin datos)'}
                                                </p>
                                            </div>
                                            {isTable && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => setExpanded(open ? null : section.id)}
                                                    aria-expanded={open}
                                                >
                                                    Personalizar
                                                    <ChevronDown className={cn('transition-transform', open && 'rotate-180')} />
                                                </Button>
                                            )}
                                        </div>

                                        {open && section.kind === 'table' && (
                                            <div className="space-y-4 border-t border-border p-3">
                                                <div>
                                                    <p className="mb-1.5 text-xs font-semibold text-muted-foreground">Columnas</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {section.table.columns.map((column) => {
                                                            const on = options.columns[section.id]?.includes(column.key)
                                                            return (
                                                                <button
                                                                    key={column.key}
                                                                    type="button"
                                                                    aria-pressed={on}
                                                                    onClick={() => toggleColumn(section.id, column.key)}
                                                                    className={cn(
                                                                        'rounded-full border px-2.5 py-1 text-xs transition-colors',
                                                                        on
                                                                            ? 'border-primary bg-primary/10 text-foreground'
                                                                            : 'border-border text-muted-foreground hover:bg-surface-muted',
                                                                    )}
                                                                >
                                                                    {column.label}
                                                                </button>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="mb-1.5 flex flex-wrap items-center justify-between gap-1">
                                                        <p className="text-xs font-semibold text-muted-foreground">Filas</p>
                                                        <span className="flex gap-1">
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => setRows(section.id, section.table.rows.map((_, i) => i))}
                                                            >
                                                                Todas
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() =>
                                                                    setRows(
                                                                        section.id,
                                                                        section.table.rows.slice(0, 10).map((_, i) => i),
                                                                    )
                                                                }
                                                            >
                                                                Primeras 10
                                                            </Button>
                                                            <Button size="sm" variant="ghost" onClick={() => setRows(section.id, [])}>
                                                                Ninguna
                                                            </Button>
                                                        </span>
                                                    </div>
                                                    <ul className="max-h-48 divide-y divide-border overflow-y-auto rounded-md border border-border text-sm">
                                                        {section.table.rows.map((row, index) => {
                                                            const labelColumn = section.table.columns.find(
                                                                (column) => column.key === section.table.rowLabelKey,
                                                            )
                                                            const label = formatCell(
                                                                row[section.table.rowLabelKey],
                                                                labelColumn?.type ?? 'text',
                                                            )
                                                            return (
                                                                <li key={index}>
                                                                    <label className="flex cursor-pointer items-center gap-2 px-3 py-1.5 hover:bg-surface-muted">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="size-3.5 accent-[var(--primary)]"
                                                                            checked={options.rows[section.id]?.includes(index) ?? false}
                                                                            onChange={() => toggleRow(section.id, index)}
                                                                        />
                                                                        <span className="truncate text-foreground">{label}</span>
                                                                    </label>
                                                                </li>
                                                            )
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                        {!FORMAT_INFO[options.format].charts && sections.some(({ section }) => section.kind === 'chart') && (
                            <p className="mt-2 text-xs text-muted-foreground">
                                Los gráficos solo se incluyen en PDF y Excel.
                            </p>
                        )}
                    </fieldset>
                </div>

                <DialogFooter className="items-center border-t border-border p-4 sm:justify-between">
                    <p className="text-xs text-muted-foreground" aria-live="polite">
                        {active.length} sección{active.length === 1 ? '' : 'es'}
                        {tableStats.tables > 0 && ` · ${tableStats.tables} tabla${tableStats.tables === 1 ? '' : 's'} (${tableStats.rows} filas)`}
                        {chartCount > 0 && ` · ${chartCount} gráfico${chartCount === 1 ? '' : 's'}`}
                    </p>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={busy}>
                            Cancelar
                        </Button>
                        <Button onClick={() => void generate()} disabled={busy || active.length === 0}>
                            {busy && <Loader2 className="animate-spin" />}
                            {busy ? 'Generando…' : `Generar ${FORMAT_INFO[options.format].label}`}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
