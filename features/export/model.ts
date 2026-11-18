export type ValueType = 'text' | 'integer' | 'decimal' | 'currency' | 'percent'
export type ExportCell = string | number | null
export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json'

export interface ExportColumn {
    key: string
    label: string
    type: ValueType
}

export interface ExportTable {
    columns: ExportColumn[]
    rows: Record<string, ExportCell>[]
    /** Column whose value names each row in the row picker. */
    rowLabelKey: string
}

export interface LegendEntry {
    label: string
    color: string
}

export type ExportSection =
    | { id: string; kind: 'summary'; title: string; paragraphs: string[] }
    | {
          id: string
          kind: 'kpis'
          title: string
          items: { label: string; value: string; detail?: string }[]
      }
    | {
          id: string
          kind: 'chart'
          title: string
          selector: string
          legend?: LegendEntry[]
          note?: string
      }
    | {
          id: string
          kind: 'heatmap'
          title: string
          rowLabels: string[]
          colLabels: string[]
          values: (number | null)[][]
          valueType: ValueType
          note?: string
      }
    | {
          id: string
          kind: 'table'
          title: string
          description?: string
          table: ExportTable
      }

export interface ExportDefinition {
    filename: string
    title: string
    subtitle?: string
    meta: { label: string; value: string }[]
    sections: ExportSection[]
}

export interface ExportOptions {
    format: ExportFormat
    orientation: 'portrait' | 'landscape'
    csvStyle: 'es' | 'standard'
    sections: string[]
    columns: Record<string, string[]>
    rows: Record<string, number[]>
}

export interface ChartImage {
    dataUrl: string
    width: number
    height: number
}

export type ChartImages = Record<string, ChartImage | undefined>
