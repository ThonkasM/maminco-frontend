export interface BasisPathInput {
  edges: string
  entry?: string
  exit?: string
}

export interface SuggestedTestCase {
  id: string
  path: string
  precondition: string
  input: string
  expected: string
}

export interface BasicPath {
  index: number
  nodeSequence: string[]
  edgeSequence: string[]
  length: number
  testCase: SuggestedTestCase
}

export interface BasisPathResult {
  nodeCount: number
  edgeCount: number
  componentCount: number
  cyclomaticComplexity: number
  entry: string
  exit: string
  totalPaths: number
  truncated: boolean
  expectedPathCount: number
  paths: BasicPath[]
}

export type BasisPathOutcome =
  | { ok: true; result: BasisPathResult }
  | { ok: false; error: string }

export const MAX_PATHS = 5000
export const MAX_EDGE_REUSE = 2

interface GraphEdge {
  from: string
  to: string
}

interface Adjacency {
  to: string
  edgeIndex: number
}

class BasisPathError extends Error {}

function parseEdges(text: string): { edges: GraphEdge[]; nodes: string[] } {
  const lines = text.split(/\r?\n/)
  const edges: GraphEdge[] = []
  const nodes = new Set<string>()

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line || line.startsWith('//') || line.startsWith('#')) return

    const arrowIndex = line.indexOf('->')
    if (arrowIndex === -1) {
      throw new BasisPathError(
        `Formato inválido en la línea ${index + 1}: "${rawLine}". Usa "A -> B".`,
      )
    }

    const from = line.slice(0, arrowIndex).trim()
    const to = line.slice(arrowIndex + 2).trim()

    if (!from || !to || to.includes('->')) {
      throw new BasisPathError(
        `Formato inválido en la línea ${index + 1}: "${rawLine}". Cada línea debe tener una sola arista "A -> B".`,
      )
    }

    edges.push({ from, to })
    nodes.add(from)
    nodes.add(to)
  })

  if (edges.length === 0) {
    throw new BasisPathError('Agrega al menos una arista con el formato "A -> B".')
  }

  return { edges, nodes: [...nodes] }
}

function resolveEndpoint(
  label: 'entrada' | 'salida',
  provided: string | undefined,
  candidates: string[],
  nodes: Set<string>,
): string {
  if (provided && provided.trim()) {
    const value = provided.trim()
    if (!nodes.has(value)) {
      throw new BasisPathError(
        `El nodo de ${label} "${value}" no existe en el grafo.`,
      )
    }
    return value
  }

  if (candidates.length === 1) return candidates[0]

  if (candidates.length === 0) {
    throw new BasisPathError(
      `No se pudo determinar el nodo de ${label}: no hay ningún nodo sin ${
        label === 'entrada' ? 'aristas entrantes' : 'aristas salientes'
      }. Especifica el nodo de ${label}.`,
    )
  }

  throw new BasisPathError(
    `Hay varios candidatos para el nodo de ${label} (${candidates.join(', ')}). Especifica el nodo de ${label}.`,
  )
}

function countComponents(nodes: string[], edges: GraphEdge[]): number {
  const parent = new Map<string, string>()
  const find = (value: string): string => {
    let current = value
    while (parent.get(current) !== current) {
      parent.set(current, parent.get(parent.get(current)!)!)
      current = parent.get(current)!
    }
    return current
  }

  for (const node of nodes) parent.set(node, node)
  for (const edge of edges) {
    const rootFrom = find(edge.from)
    const rootTo = find(edge.to)
    if (rootFrom !== rootTo) parent.set(rootFrom, rootTo)
  }

  const roots = new Set(nodes.map((node) => find(node)))
  return roots.size
}

function enumeratePaths(
  adjacency: Map<string, Adjacency[]>,
  entry: string,
  exit: string,
  cap: number,
): { paths: number[][]; truncated: boolean } {
  const paths: number[][] = []
  const current: number[] = []
  const usage = new Map<number, number>()
  let truncated = false

  const walk = (node: string): void => {
    if (paths.length >= cap) {
      truncated = true
      return
    }

    if (node === exit) {
      paths.push([...current])
      return
    }

    for (const next of adjacency.get(node) ?? []) {
      const used = usage.get(next.edgeIndex) ?? 0
      if (used >= MAX_EDGE_REUSE) continue

      usage.set(next.edgeIndex, used + 1)
      current.push(next.edgeIndex)
      walk(next.to)
      current.pop()
      usage.set(next.edgeIndex, used)

      if (paths.length >= cap) {
        truncated = true
        return
      }
    }
  }

  walk(entry)
  return { paths, truncated }
}

function highestSetBit(vector: number[]): number {
  for (let word = vector.length - 1; word >= 0; word--) {
    const value = vector[word]
    if (value !== 0) {
      return word * 32 + (31 - Math.clz32(value))
    }
  }
  return -1
}

function selectIndependentPaths(
  paths: number[][],
  edgeCount: number,
): number[][] {
  const wordCount = Math.max(1, Math.ceil(edgeCount / 32))
  const basis = new Map<number, number[]>()
  const selected: number[][] = []

  for (const path of paths) {
    const vector = new Array<number>(wordCount).fill(0)
    for (const edgeIndex of path) {
      vector[edgeIndex >> 5] ^= 1 << (edgeIndex & 31)
    }

    let pivot = highestSetBit(vector)
    while (pivot >= 0 && basis.has(pivot)) {
      const other = basis.get(pivot)!
      for (let word = 0; word < wordCount; word++) {
        vector[word] ^= other[word]
      }
      pivot = highestSetBit(vector)
    }

    if (pivot >= 0) {
      basis.set(pivot, vector)
      selected.push(path)
    }
  }

  return selected
}

function buildTestCase(
  index: number,
  nodeSequence: string[],
): SuggestedTestCase {
  return {
    id: `CP-${String(index + 1).padStart(2, '0')}`,
    path: nodeSequence.join(' -> '),
    precondition: 'Precondición por definir.',
    input: 'Datos de entrada por definir.',
    expected: 'Resultado esperado por definir.',
  }
}

export function analyzeBasisPath(input: BasisPathInput): BasisPathOutcome {
  try {
    const { edges, nodes } = parseEdges(input.edges)
    const nodeSet = new Set(nodes)

    const adjacency = new Map<string, Adjacency[]>()
    const indegree = new Map<string, number>()
    const outdegree = new Map<string, number>()
    for (const node of nodes) {
      adjacency.set(node, [])
      indegree.set(node, 0)
      outdegree.set(node, 0)
    }

    edges.forEach((edge, edgeIndex) => {
      adjacency.get(edge.from)!.push({ to: edge.to, edgeIndex })
      outdegree.set(edge.from, outdegree.get(edge.from)! + 1)
      indegree.set(edge.to, indegree.get(edge.to)! + 1)
    })

    const componentCount = countComponents(nodes, edges)
    if (componentCount > 1) {
      throw new BasisPathError(
        `El grafo no es conexo: se detectaron ${componentCount} componentes. Conecta todos los nodos antes de calcular.`,
      )
    }

    const entryCandidates = nodes.filter((node) => indegree.get(node) === 0)
    const exitCandidates = nodes.filter((node) => outdegree.get(node) === 0)

    const entry = resolveEndpoint('entrada', input.entry, entryCandidates, nodeSet)
    const exit = resolveEndpoint('salida', input.exit, exitCandidates, nodeSet)

    if (entry === exit) {
      throw new BasisPathError(
        'El nodo de entrada y el de salida deben ser distintos.',
      )
    }

    const nodeCount = nodes.length
    const edgeCount = edges.length
    const cyclomaticComplexity = edgeCount - nodeCount + 2 * componentCount

    const { paths: enumeratedPaths, truncated } = enumeratePaths(
      adjacency,
      entry,
      exit,
      MAX_PATHS,
    )

    if (enumeratedPaths.length === 0) {
      throw new BasisPathError(
        `No existe un camino de "${entry}" a "${exit}". Revisa la dirección de las aristas.`,
      )
    }

    const orderedPaths = [...enumeratedPaths].sort(
      (a, b) => a.length - b.length,
    )
    const selected = selectIndependentPaths(orderedPaths, edgeCount)

    const basicPaths: BasicPath[] = selected.map((path, index) => {
      const edgeSequence = path.map((edgeIndex) => {
        const edge = edges[edgeIndex]
        return `${edge.from} -> ${edge.to}`
      })
      const nodeSequence = [entry, ...path.map((edgeIndex) => edges[edgeIndex].to)]

      return {
        index: index + 1,
        nodeSequence,
        edgeSequence,
        length: path.length,
        testCase: buildTestCase(index, nodeSequence),
      }
    })

    return {
      ok: true,
      result: {
        nodeCount,
        edgeCount,
        componentCount,
        cyclomaticComplexity,
        entry,
        exit,
        totalPaths: enumeratedPaths.length,
        truncated,
        expectedPathCount: cyclomaticComplexity,
        paths: basicPaths,
      },
    }
  } catch (error) {
    if (error instanceof BasisPathError) {
      return { ok: false, error: error.message }
    }
    return {
      ok: false,
      error: 'No se pudo analizar el grafo. Revisa la entrada e inténtalo de nuevo.',
    }
  }
}
