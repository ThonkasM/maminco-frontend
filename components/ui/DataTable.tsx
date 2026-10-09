'use client'

import * as React from 'react'
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { EmptyState } from './EmptyState'
import { Skeleton } from './Skeleton'
import { Table, TableWrapper, TBody, Td, Th, THead, Tr } from './Table'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    /** Text alignment for the header and cells. */
    align?: 'left' | 'center' | 'right'
    headerClassName?: string
    cellClassName?: string
  }
}

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  loading?: boolean
  className?: string
  /** Enables clickable sortable headers (per-column opt-out via `enableSorting`). */
  enableSorting?: boolean
  initialSorting?: SortingState
  onSortingChange?: (sorting: SortingState) => void
  getRowId?: (row: TData) => string
  onRowClick?: (row: TData) => void
  /** Rendered inside the table body when there are no rows. */
  emptyState?: React.ReactNode
  skeletonRows?: number
}

const alignClass = (align: 'left' | 'center' | 'right' | undefined) =>
  align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : undefined

export function DataTable<TData, TValue>({
  columns,
  data,
  loading = false,
  className,
  enableSorting = true,
  initialSorting = [],
  onSortingChange,
  getRowId,
  onRowClick,
  emptyState,
  skeletonRows = 6,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSorting)

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    enableSorting,
    getRowId,
    onSortingChange: (updater) => {
      setSorting((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater
        onSortingChange?.(next)
        return next
      })
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
  })

  const columnCount = table.getAllColumns().length

  return (
    <TableWrapper className={className}>
      <Table>
        <THead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta
                const canSort = enableSorting && header.column.getCanSort()
                const sorted = header.column.getIsSorted()

                return (
                  <Th
                    key={header.id}
                    className={cn(alignClass(meta?.align), meta?.headerClassName)}
                    aria-sort={
                      sorted === 'asc'
                        ? 'ascending'
                        : sorted === 'desc'
                          ? 'descending'
                          : undefined
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="group inline-flex items-center gap-1 hover:text-foreground"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' ? (
                          <ArrowUp className="size-3.5" aria-hidden="true" />
                        ) : sorted === 'desc' ? (
                          <ArrowDown className="size-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronsUpDown
                            className="size-3.5 opacity-0 transition-opacity group-hover:opacity-60"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </Th>
                )
              })}
            </Tr>
          ))}
        </THead>
        <TBody>
          {loading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <Tr key={`skeleton-${rowIndex}`}>
                {Array.from({ length: columnCount }).map((__, cellIndex) => (
                  <Td key={`skeleton-${rowIndex}-${cellIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </Td>
                ))}
              </Tr>
            ))
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                className={onRowClick ? 'cursor-pointer' : undefined}
              >
                {row.getVisibleCells().map((cell) => (
                  <Td
                    key={cell.id}
                    className={cn(
                      alignClass(cell.column.columnDef.meta?.align),
                      cell.column.columnDef.meta?.cellClassName,
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                ))}
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={columnCount} className="py-0">
                {emptyState ?? (
                  <EmptyState title="Sin resultados" description="No hay datos para mostrar." />
                )}
              </Td>
            </Tr>
          )}
        </TBody>
      </Table>
    </TableWrapper>
  )
}
