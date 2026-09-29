import type { Metadata } from 'next'
import { BasisPathTool } from '@/components/marketing/BasisPathTool'

export const metadata: Metadata = {
  title: 'Herramienta de camino básico',
  description:
    'Calcula la complejidad ciclomática de McCabe y un conjunto de caminos básicos linealmente independientes a partir del grafo de flujo.',
}

export default function BasisPathPage() {
  return <BasisPathTool />
}
