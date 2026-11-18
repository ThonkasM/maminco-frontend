'use client'

import * as React from 'react'
import { AlertTriangle, Calculator, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Textarea } from '@/components/ui/Textarea'
import { analyzeBasisPath, type BasisPathOutcome } from '@/lib/utils/basisPath'
import {
  BASIS_PATH_EXAMPLES,
  DEFAULT_BASIS_PATH_EXAMPLE,
} from '@/lib/utils/basisPathExamples'
import { BasisPathResults } from './BasisPathResults'

export function BasisPathTool() {
  const [edgesText, setEdgesText] = React.useState(DEFAULT_BASIS_PATH_EXAMPLE.edges)
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

  const loadExample = (id: string) => {
    const example = BASIS_PATH_EXAMPLES.find((item) => item.id === id)
    if (!example) return
    setEdgesText(example.edges)
    setEntry(example.entry)
    setExit(example.exit)
    setOutcome(null)
  }

  const handleReset = () => {
    setEdgesText(DEFAULT_BASIS_PATH_EXAMPLE.edges)
    setEntry('')
    setExit('')
    setOutcome(null)
  }

  return (
    <>
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
              Usa una arista por línea. Las líneas vacías y las que inician con{' '}
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

          <Card>
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-medium">Ejemplos</p>
              <div className="flex flex-wrap gap-2">
                {BASIS_PATH_EXAMPLES.map((example) => (
                  <Button
                    key={example.id}
                    type="button"
                    variant="outline"
                    size="sm"
                    shape="pill"
                    onClick={() => loadExample(example.id)}
                    title={`N=${example.nodes}, E=${example.edgeCount}, V=${example.complexity}`}
                  >
                    {example.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" shape="pill" size="lg">
              <Calculator aria-hidden="true" />
              Calcular
            </Button>
            <Button type="button" variant="outline" shape="pill" onClick={handleReset}>
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
    </>
  )
}
