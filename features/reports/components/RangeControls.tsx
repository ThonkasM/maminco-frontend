'use client'
import { Button, Card, CardContent, Input, Label, Select } from '@/components/ui'
import type { AreaResponse } from '@/features/areas/api'
import type { TableResponse } from '@/features/tables/api'
import {
    REPORT_PRESETS,
    type ReportPresetId,
} from '@/lib/utils/reportRange'

interface RangeControlsProps {
    preset: ReportPresetId
    onPresetChange: (preset: ReportPresetId) => void
    customFrom: string
    customTo: string
    onCustomFromChange: (value: string) => void
    onCustomToChange: (value: string) => void
    maxDate: string
    areaId: string
    onAreaIdChange: (value: string) => void
    tableId: string
    onTableIdChange: (value: string) => void
    areas: AreaResponse[]
    tables: TableResponse[]
    loadingFilters: boolean
}

export function RangeControls({
    preset,
    onPresetChange,
    customFrom,
    customTo,
    onCustomFromChange,
    onCustomToChange,
    maxDate,
    areaId,
    onAreaIdChange,
    tableId,
    onTableIdChange,
    areas,
    tables,
    loadingFilters,
}: RangeControlsProps) {
    return (
        <Card>
            <CardContent className="space-y-4 p-4">
                <div className="flex flex-wrap gap-2">
                    {REPORT_PRESETS.map((item) => (
                        <Button
                            key={item.id}
                            variant={preset === item.id ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => onPresetChange(item.id)}
                        >
                            {item.label}
                        </Button>
                    ))}
                </div>

                {preset === 'custom' && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:max-w-md">
                        <div className="space-y-1.5">
                            <Label htmlFor="report-from">Desde</Label>
                            <Input
                                id="report-from"
                                type="date"
                                max={maxDate}
                                value={customFrom}
                                onChange={(e) =>
                                    onCustomFromChange(e.target.value)
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="report-to">Hasta</Label>
                            <Input
                                id="report-to"
                                type="date"
                                max={maxDate}
                                value={customTo}
                                onChange={(e) => onCustomToChange(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                        <Label htmlFor="report-area">Área</Label>
                        <Select
                            id="report-area"
                            value={areaId}
                            disabled={loadingFilters}
                            onChange={(e) => onAreaIdChange(e.target.value)}
                        >
                            <option value="">Todas las áreas</option>
                            {areas.map((area) => (
                                <option key={area.id} value={area.id}>
                                    {area.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="report-table">Mesa</Label>
                        <Select
                            id="report-table"
                            value={tableId}
                            disabled={loadingFilters || tables.length === 0}
                            onChange={(e) => onTableIdChange(e.target.value)}
                        >
                            <option value="">Todas las mesas</option>
                            {tables.map((table) => (
                                <option key={table.id} value={table.id}>
                                    Mesa {table.number}
                                    {table.areaName ? ` · ${table.areaName}` : ''}
                                </option>
                            ))}
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
