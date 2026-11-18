'use client'
import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui'
import type { Dataset } from '../api'
import { formatValue } from './ChartView'

type Row = Dataset['rows'][number]

export function DatasetTable({ dataset }: { dataset: Dataset }) {
    const columns = useMemo<ColumnDef<Row>[]>(
        () =>
            dataset.columns.map((column) => {
                const numeric = column.kind === 'number'
                return {
                    id: column.name,
                    header: column.label,
                    accessorFn: (row) => row[column.name],
                    sortingFn: numeric ? 'basic' : 'alphanumeric',
                    meta: { align: numeric ? 'right' : 'left' },
                    cell: ({ getValue }) =>
                        numeric ? (
                            <span className="tabular-nums">
                                {formatValue(Number(getValue() ?? 0), column.format)}
                            </span>
                        ) : (
                            String(getValue() ?? '')
                        ),
                } satisfies ColumnDef<Row>
            }),
        [dataset.columns],
    )

    return <DataTable columns={columns} data={dataset.rows} />
}
