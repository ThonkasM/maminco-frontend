'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  GitBranch,
  RotateCcw,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { DataTable } from '@/components/ui/DataTable'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import type { ColumnDef } from '@tanstack/react-table'
import {
  MAX_PATHS,
  analyzeBasisPath,
  type BasicPath,
  type BasisPathOutcome,
} from '@/lib/utils/basisPath'

const testCaseColumns: ColumnDef<BasicPath>[] = [
  {
    id: 'case',
    header: 'Caso',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.testCase.id}</span>
    ),
  },
  {
    id: 'path',
    header: 'Camino',
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.testCase.path}</span>
    ),
  },
  {
    id: 'precondition',
    header: 'Precondición',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.testCase.precondition}
      </span>
    ),
  },
  {
    id: 'input',
    header: 'Entrada',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.testCase.input}
      </span>
    ),
  },
  {
    id: 'expected',
    header: 'Resultado esperado',
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.original.testCase.expected}
      </span>
    ),
  },
]

const DEFAULT_EDGES = `inicio -> D1
D1 -> FIN
D1 -> D2
D2 -> FIN
D2 -> D3
D3 -> FIN
D3 -> D4
D4 -> FIN
D4 -> D5
D5 -> preparar
D5 -> D6
D6 -> FIN
D6 -> preparar
preparar -> D7
D7 -> leer
leer -> D8
D8 -> FIN
D8 -> D9
D9 -> FIN
D9 -> acumular
acumular -> D7
D7 -> transaccion
transaccion -> emitir
emitir -> FIN`

export function BasisPathTool() {
  const [edgesText, setEdgesText] = React.useState(DEFAULT_EDGES)
  const [entry, setEntry] = React.useState('')
  const [exit, setExit] = React.useState('')
  const [outcome, setOutcome] = React.useState<BasisPathOutcome | null>(null)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setOutcome(
      analyzeBasisPath({
        edges: edgesText,
        entry: entry.trim() || undefined,
        exit: exit.trim() || undefined,
      }),
    )
  }

  const handleReset = () => {
    setEdgesText(DEFAULT_EDGES)
    setEntry('')
    setExit('')
    setOutcome(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="Maminco inicio"
          >
            <Image
              src="/maminco-logo.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-lg font-semibold tracking-tight">Maminco</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft aria-hidden="true" />
              Volver al sitio
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-3xl">
          <Badge variant="info">
            <GitBranch aria-hidden="true" className="size-3.5" />
            Herramienta de QA
          </Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
            Camino básico
          </h1>
          <p className="mt-4 text-muted-foreground">
            Describe el grafo de flujo con aristas <span className="font-mono">A -&gt; B</span>{' '}
            (una por línea). La herramienta calcula N, E, P, la complejidad
            ciclomática V = E − N + 2P y un conjunto de caminos básicos linealmente
            independientes, con un caso de prueba sugerido por camino.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card>
            <CardContent className="space-y-2 p-6">
              <Label htmlFor="basis-edges">Aristas del grafo</Label>
              <Textarea
                id="basis-edges"
                value={edgesText}
                onChange={(event) => setEdgesText(event.target.value)}
                rows={16}
                spellCheck={false}
                className="font-mono text-xs"
                aria-describedby="basis-edges-help"
              />
              <p id="basis-edges-help" className="text-xs text-muted-foreground">
                Usa una arista por línea. Las líneas vacías y las que inician con
                {' '}
                <span className="font-mono">{'//'}</span> o{' '}
                <span className="font-mono">{'#'}</span> se ignoran.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="basis-entry">Nodo de entrada (opcional)</Label>
                  <Input
                    id="basis-entry"
                    value={entry}
                    onChange={(event) => setEntry(event.target.value)}
                    placeholder="inicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="basis-exit">Nodo de salida (opcional)</Label>
                  <Input
                    id="basis-exit"
                    value={exit}
                    onChange={(event) => setExit(event.target.value)}
                    placeholder="FIN"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Si se omiten, se infieren del grafo cuando hay un único nodo sin
                  aristas entrantes o salientes.
                </p>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-3">
              <Button type="submit" shape="pill" size="lg">
                <Calculator aria-hidden="true" />
                Calcular
              </Button>
              <Button
                type="button"
                variant="outline"
                shape="pill"
                onClick={handleReset}
              >
                <RotateCcw aria-hidden="true" />
                Restablecer ejemplo
              </Button>
            </div>
          </div>
        </form>

        {outcome && !outcome.ok && (
          <div
            role="alert"
            className="mt-8 flex items-start gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger"
          >
            <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            <p>{outcome.error}</p>
          </div>
        )}

        {outcome && outcome.ok && <BasisPathResults result={outcome.result} />}
      </main>
    </div>
  )
}

function BasisPathResults({
  result,
}: {
  result: Extract<BasisPathOutcome, { ok: true }>['result']
}) {
  const stats = [
    { label: 'Nodos (N)', value: result.nodeCount },
    { label: 'Aristas (E)', value: result.edgeCount },
    { label: 'Componentes (P)', value: result.componentCount },
    { label: 'Complejidad V', value: result.cyclomaticComplexity },
  ]

  return (
    <div className="mt-10 space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-3xl font-semibold tracking-tight text-primary">
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
          Caminos encontrados: {result.totalPaths}
          {result.truncated ? ` (tope de ${MAX_PATHS})` : ''}
        </span>
      </div>

      {result.truncated && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Se alcanzó el tope de {MAX_PATHS} caminos. La base seleccionada puede
            estar incompleta; simplifica el grafo si necesitas mayor cobertura.
          </p>
        </div>
      )}

      {result.paths.length < result.expectedPathCount && (
        <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-warning">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          <p>
            Se seleccionaron {result.paths.length} caminos independientes de los{' '}
            {result.expectedPathCount} esperados (V). Revisa la estructura del
            grafo.
          </p>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Caminos básicos ({result.paths.length})
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Conjunto linealmente independiente seleccionado por eliminación gaussiana
          sobre GF(2).
        </p>

        <ol className="mt-6 space-y-4">
          {result.paths.map((path) => (
            <li key={path.index}>
              <Card>
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
                  <p className="font-mono text-xs text-muted-foreground">
                    {path.edgeSequence.join('  ·  ')}
                  </p>
                </CardContent>
              </Card>
            </li>
          ))}
        </ol>
      </div>

      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Casos de prueba sugeridos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Un caso por camino. El equipo de QA completa datos y resultados
          esperados.
        </p>

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
