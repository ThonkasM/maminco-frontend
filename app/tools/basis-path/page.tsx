import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { buttonVariants } from '@/components/ui/Button'
import { BasisPathTool } from '@/components/marketing/BasisPathTool'

export const metadata: Metadata = {
  title: 'Herramienta de camino básico',
  description:
    'Calcula la complejidad ciclomática de McCabe y un conjunto de caminos básicos linealmente independientes a partir del grafo de flujo.',
}

export default function BasisPathPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Maminco inicio">
            <Image
              src="/maminco-logo-128.png"
              alt=""
              width={32}
              height={32}
              className="size-8"
            />
            <span className="text-lg font-semibold tracking-tight">Maminco</span>
          </Link>
          <Link href="/" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
            <ArrowLeft aria-hidden="true" />
            Volver al sitio
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
            Describe el grafo de flujo con aristas{' '}
            <span className="font-mono">A -&gt; B</span> (una por línea). La
            herramienta calcula N, E, P, la complejidad ciclomática V = E − N + 2P
            y V caminos básicos linealmente independientes (rango exacto sobre los
            racionales), con un caso de prueba sugerido por camino.
          </p>
        </div>

        <BasisPathTool />
      </main>
    </div>
  )
}
