'use client'

import * as React from 'react'
import { AlertTriangle, ClipboardCopy, Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { toast } from '@/components/shared/ToastProvider'
import { cn } from '@/lib/utils/cn'
import {
  MAX_PATHS,
  MAX_STEPS,
  type BasicPath,
  type BasisPathResult,
} from '@/lib/utils/basisPath'
import { testCasesToCsv, testCasesToMarkdown } from '@/lib/utils/basisPathExport'
import { BasisPathGraph } from './BasisPathGraph'

const testCaseColumns: ColumnDef<BasicPath>[] = [
  {
    id: 'case',
    header: 'Caso',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.testCase.id}</span>,
  },
  {
    id: 'path',
    header: 'Camino',
    cell: ({ row }) => <span className="font-mono text-xs">{row.original.testCase.path}</span>,
  },
  {
    id: 'precondition',
    header: 'Precondición',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.testCase.precondition}</span>
    ),
  },
  {
    id: 'input',
    header: 'Entrada',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.testCase.input}</span>
    ),
  },
  {
    id: 'expected',
    header: 'Resultado esperado',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">{row.original.testCase.expected}</span>
    ),
  },
]

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
      <p>{children}</p>
    </div>
  )
}

export function BasisPathResults({ result }: { result: BasisPathResult }) {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(null)
  const selected = result.paths.find((path) => path.index === selectedIndex) ?? null

  const highlightedEdges = React.useMemo(
    () => new Set(selected?.edgeIndices ?? []),
    [selected],
  )
  const highlightedNodes = React.useMemo(
    () => new Set(selected?.nodeSequence ?? []),
    [selected],
  )

  const stats = [
    { label: 'Nodos (N)', value: result.nodeCount },
    { label: 'Aristas (E)', value: result.edgeCount },
    { label: 'Componentes (P)', value: result.componentCount },
    { label: 'Complejidad V', value: result.cyclomaticComplexity },
  ]

  const copyMarkdown = async () => {
    try {
      await navigator.clipboard.writeText(testCasesToMarkdown(result.paths))
      toast.success('Casos de prueba copiados en Markdown')
    } catch {
      toast.error('No se pudo copiar al portapapeles')
    }
  }

  return (
    <div className="mt-10 space-y-8" aria-live="polite">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-primary-ink">
                {stat.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Badge variant="neutral">
          Entrada: <span className="font-mono">{result.entry}</span>
        </Badge>
        <Badge variant="neutral">
          Salida: <span className="font-mono">{result.exit}</span>
        </Badge>
        <span>
          Caminos independientes: {result.rank} de {result.expectedPathCount} (V)
        </span>
      </div>

      {!result.complete && (
        <Warning>
          Solo se encontraron {result.rank} caminos linealmente independientes de los{' '}
          {result.expectedPathCount} esperados (V).
          {result.truncated
            ? ` La exploración alcanzó su tope (${MAX_STEPS} pasos o ${MAX_PATHS} caminos); simplifica el grafo o divídelo en subgrafos.`
            : ' Revisa la estructura del grafo.'}
        </Warning>
      )}

      <div className="space-y-3">
        <h2 className="text-xl font-semibold tracking-tight">Grafo de flujo</h2>
        <p className="text-sm text-muted-foreground">
          {selected
            ? `Resaltado: camino ${selected.testCase.id}.`
            : 'Selecciona un camino en la lista para resaltarlo.'}
        </p>
        <BasisPathGraph
          result={result}
          highlightedEdges={highlightedEdges}
          highlightedNodes={highlightedNodes}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Caminos básicos ({result.paths.length})
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conjunto linealmente independiente (eliminación gaussiana exacta sobre
          vectores de conteo de aristas), con preferencia por los caminos más
          cortos.
        </p>

        <ol className="mt-6 space-y-4">
          {result.paths.map((path) => {
            const active = path.index === selectedIndex
            return (
              <li key={path.index}>
                <button
                  type="button"
                  onClick={() => setSelectedIndex(active ? null : path.index)}
                  aria-pressed={active}
                  className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Card className={cn(active && 'border-primary ring-1 ring-primary')}>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                          {path.index}
                        </span>
                        <span className="font-mono text-sm text-foreground">
                          {path.nodeSequence.join(' → ')}
                        </span>
                        <Badge variant="neutral">{path.length} aristas</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Casos de prueba sugeridos</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Un caso por camino. El equipo de QA completa datos y resultados esperados.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={copyMarkdown}>
              <ClipboardCopy aria-hidden="true" />
              Copiar Markdown
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                download('casos-de-prueba.csv', testCasesToCsv(result.paths), 'text/csv;charset=utf-8')
              }
            >
              <Download aria-hidden="true" />
              Exportar CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                download(
                  'casos-de-prueba.md',
                  testCasesToMarkdown(result.paths),
                  'text/markdown;charset=utf-8',
                )
              }
            >
              <Download aria-hidden="true" />
              Exportar Markdown
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={testCaseColumns}
            data={result.paths}
            enableSorting={false}
            getRowId={(path) => path.testCase.id}
          />
        </div>
      </div>
    </div>
  )
}
