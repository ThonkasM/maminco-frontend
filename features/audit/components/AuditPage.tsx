'use client'
import { useMemo, useState } from 'react'
import { ScrollText, Search } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge, Button, Card, CardContent, DataTable, EmptyState, Input, Pagination, Select, Skeleton } from '@/components/ui'
import { ExportButton } from '@/features/export/components/ExportButton'
import type { ExportDefinition } from '@/features/export/model'
import { useClosureStatus } from '@/features/closures/hooks'
import { formatCurrency } from '@/lib/utils/currency'
import { buildPresetRange, REPORT_PRESETS, todayInBusinessTz, type ReportPresetId } from '@/lib/utils/reportRange'
import { useDebounced } from '../useDebounced'
import type { AuditOrder } from '../api'
import { useAuditOrders, useAuditStaff } from '../hooks'
import { ACTION_GROUP_OPTIONS, changesLabel, STATUS_LABELS, type ActionGroupFilter } from '../lib'
import { AuditOrderDialog } from './AuditOrderDialog'

const PRESETS = REPORT_PRESETS.filter((preset) => ['today', 'yesterday', 'thisWeek', 'thisMonth', 'custom'].includes(preset.id))

const dateTime = (iso: string) => new Date(iso).toLocaleString('es-BO', { dateStyle: 'short', timeStyle: 'short' })

export function AuditPage() {
    const closure = useClosureStatus()
    const businessToday = closure.data?.currentBusinessDate ?? todayInBusinessTz()
    const [preset, setPreset] = useState<ReportPresetId>('today')
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [userId, setUserId] = useState('')
    const [status, setStatus] = useState('')
    const [actionGroup, setActionGroup] = useState<ActionGroupFilter>('')
    const [searchText, setSearchText] = useState('')
    const [page, setPage] = useState(1)
    const [selected, setSelected] = useState<AuditOrder | null>(null)
    const search = useDebounced(searchText, 300)
    const staff = useAuditStaff()

    const range = useMemo(() => {
        if (preset === 'today') return {}
        if (preset === 'custom') return { from: customFrom || undefined, to: customTo || customFrom || undefined }
        const base = buildPresetRange(preset, businessToday)
        return { from: base.from, to: base.to > businessToday ? businessToday : base.to }
    }, [preset, customFrom, customTo, businessToday])

    const orders = useAuditOrders({
        page,
        ...range,
        userId: userId || undefined,
        status: status || undefined,
        search: search || undefined,
        actionGroup: actionGroup || undefined,
    })

    const reset = <T,>(setter: (value: T) => void) => (value: T) => {
        setter(value)
        setPage(1)
    }

    const columns = useMemo<ColumnDef<AuditOrder>[]>(
        () => [
            {
                id: 'orderNumber',
                header: 'Orden',
                accessorFn: (row) => row.orderNumber,
                cell: ({ row }) => (
                    <>
                        <span className="font-medium text-foreground">#{row.original.orderNumber}</span>
                        <span className="block text-xs text-muted-foreground">
                            {row.original.tableName}
                            {row.original.areaName ? ` · ${row.original.areaName}` : ''}
                        </span>
                    </>
                ),
            },
            {
                id: 'status',
                header: 'Estado',
                enableSorting: false,
                cell: ({ row }) => (
                    <Badge variant={row.original.status === 'CLOSED' ? 'success' : row.original.status === 'CANCELLED' ? 'danger' : 'warning'}>
                        {STATUS_LABELS[row.original.status]}
                    </Badge>
                ),
            },
            { id: 'createdByName', header: 'Creada por', accessorFn: (row) => row.createdByName, cell: ({ row }) => <span className="text-muted-foreground">{row.original.createdByName}</span> },
            {
                id: 'people',
                header: 'Quién cambió',
                enableSorting: false,
                cell: ({ row }) =>
                    row.original.users.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                    ) : (
                        <span className="flex flex-wrap gap-1">
                            {row.original.users.map((user) => (
                                <Badge key={user.id} variant="neutral">
                                    {user.name} ×{user.changes}
                                </Badge>
                            ))}
                        </span>
                    ),
            },
            {
                id: 'changeCount',
                header: 'Cambios',
                accessorFn: (row) => row.changeCount,
                meta: { align: 'right' },
                cell: ({ row }) => <span className="tabular-nums">{row.original.changeCount}</span>,
            },
            {
                id: 'lastChangeAt',
                header: 'Último cambio',
                accessorFn: (row) => row.lastChangeAt ?? '',
                cell: ({ row }) =>
                    row.original.lastChangeAt ? (
                        <>
                            <span className="whitespace-nowrap text-foreground">{dateTime(row.original.lastChangeAt)}</span>
                            <span className="block text-xs text-muted-foreground">{row.original.lastChangeBy}</span>
                        </>
                    ) : null,
            },
            { id: 'total', header: 'Total', accessorFn: (row) => row.total, meta: { align: 'right' }, cell: ({ row }) => formatCurrency(row.original.total) },
        ],
        [],
    )

    const buildExport = (): ExportDefinition | null => {
        const data = orders.data
        if (!data) return null
        return {
            filename: `auditoria-${data.from}-a-${data.to}`,
            title: 'Auditoría de órdenes',
            subtitle: 'Quién hizo cada cambio en las órdenes del periodo',
            meta: [
                { label: 'Periodo', value: `${data.from} al ${data.to}` },
                { label: 'Órdenes', value: String(data.total) },
            ],
            sections: [
                {
                    id: 'audit-orders',
                    kind: 'table',
                    title: `Órdenes con actividad (${data.data.length} de ${data.total})`,
                    table: {
                        rowLabelKey: 'order',
                        columns: [
                            { key: 'order', label: 'Orden', type: 'text' },
                            { key: 'table', label: 'Mesa', type: 'text' },
                            { key: 'status', label: 'Estado', type: 'text' },
                            { key: 'createdBy', label: 'Creada por', type: 'text' },
                            { key: 'people', label: 'Quién cambió', type: 'text' },
                            { key: 'changes', label: 'Cambios', type: 'integer' },
                            { key: 'last', label: 'Último cambio', type: 'text' },
                            { key: 'total', label: 'Total', type: 'currency' },
                        ],
                        rows: data.data.map((order) => ({
                            order: `#${order.orderNumber}`,
                            table: order.tableName,
                            status: STATUS_LABELS[order.status],
                            createdBy: order.createdByName,
                            people: order.users.map((user) => `${user.name} (${changesLabel(user.changes)})`).join(', '),
                            changes: order.changeCount,
                            last: order.lastChangeAt ? `${dateTime(order.lastChangeAt)} · ${order.lastChangeBy ?? ''}` : null,
                            total: order.total,
                        })),
                    },
                },
            ],
        }
    }

    const data = orders.data
    const periodText = data ? (data.from === data.to ? data.from : `${data.from} al ${data.to}`) : ''

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="font-display text-3xl font-normal uppercase tracking-wide text-foreground">Auditoría</h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                        Revisa las órdenes del periodo y toca una para ver quién agregó, quitó o cambió productos, descuentos, estados y pagos.
                    </p>
                </div>
                <ExportButton label="Exportar" size="sm" build={buildExport} disabled={!data || data.data.length === 0} />
            </div>

            <Card>
                <CardContent className="space-y-4 p-4">
                    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Periodo">
                        {PRESETS.map((item) => (
                            <Button key={item.id} size="sm" variant={preset === item.id ? 'primary' : 'ghost'} aria-pressed={preset === item.id} onClick={() => { setPreset(item.id); setPage(1) }}>
                                {item.id === 'today' ? 'Hoy (día en curso)' : item.label}
                            </Button>
                        ))}
                        {preset === 'custom' && (
                            <span className="flex flex-wrap items-center gap-2">
                                <Input type="date" aria-label="Desde" max={businessToday} value={customFrom} onChange={(event) => reset(setCustomFrom)(event.target.value)} className="w-40" />
                                <span className="text-sm text-muted-foreground">a</span>
                                <Input type="date" aria-label="Hasta" max={businessToday} value={customTo} onChange={(event) => reset(setCustomTo)(event.target.value)} className="w-40" />
                            </span>
                        )}
                        {periodText && <span className="ml-auto text-sm text-muted-foreground">Mostrando {periodText}</span>}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                            <Input value={searchText} onChange={(event) => { setSearchText(event.target.value); setPage(1) }} placeholder="Buscar por número de orden" aria-label="Buscar por número de orden" className="pl-9" />
                        </div>
                        <Select value={userId} onChange={(event) => reset(setUserId)(event.target.value)} aria-label="Persona">
                            <option value="">Todas las personas</option>
                            {(staff.data ?? []).map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name}
                                </option>
                            ))}
                        </Select>
                        <Select value={actionGroup} onChange={(event) => reset(setActionGroup)(event.target.value as ActionGroupFilter)} aria-label="Tipo de cambio">
                            <option value="">Todos los cambios</option>
                            {ACTION_GROUP_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                        <Select value={status} onChange={(event) => reset(setStatus)(event.target.value)} aria-label="Estado">
                            <option value="">Todos los estados</option>
                            {Object.entries(STATUS_LABELS).map(([id, label]) => (
                                <option key={id} value={id}>
                                    {label}
                                </option>
                            ))}
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {orders.isLoading ? (
                <Skeleton className="h-64 w-full" />
            ) : orders.isError ? (
                <EmptyState icon={<ScrollText />} title="No se pudo cargar la auditoría" description="Verifica tu conexión e inténtalo de nuevo." />
            ) : !data || data.data.length === 0 ? (
                <EmptyState icon={<ScrollText />} title="Sin órdenes con actividad" description="No hay cambios que coincidan con este periodo y estos filtros." />
            ) : (
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        {data.total} orden{data.total === 1 ? '' : 'es'} con actividad. Toca una fila para ver el detalle.
                    </p>
                    <div className={orders.isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
                        <DataTable columns={columns} data={data.data} getRowId={(row) => row.id} onRowClick={setSelected} />
                    </div>
                    <Pagination page={page} totalPages={data.totalPages} onPageChange={setPage} />
                </div>
            )}

            <AuditOrderDialog order={selected} onClose={() => setSelected(null)} />
        </div>
    )
}
