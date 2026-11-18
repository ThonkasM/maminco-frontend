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

export interface GraphEdge {
  from: string
  to: string
}

export interface BasicPath {
  index: number
  nodeSequence: string[]
  edgeSequence: string[]
  edgeIndices: number[]
  length: number
  testCase: SuggestedTestCase
}

export interface BasisPathResult {
  nodes: string[]
  edges: GraphEdge[]
  nodeCount: number
  edgeCount: number
  componentCount: number
  cyclomaticComplexity: number
  entry: string
  exit: string
  candidatesExplored: number
  stepsUsed: number
  truncated: boolean
  rank: number
  expectedPathCount: number
  complete: boolean
  paths: BasicPath[]
}

export type BasisPathOutcome =
  | { ok: true; result: BasisPathResult }
  | { ok: false; error: string }

export const MAX_PATHS = 5000
export const MAX_STEPS = 200000
export const MAX_EDGE_REUSE = 2
export const MAX_EDGES = 400

const ZERO = BigInt(0)
const ONE = BigInt(1)

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

  if (edges.length > MAX_EDGES) {
    throw new BasisPathError(
      `El grafo tiene ${edges.length} aristas; el máximo admitido es ${MAX_EDGES}.`,
    )
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

  return new Set(nodes.map((node) => find(node))).size
}

function bfs(
  start: string,
  neighbours: Map<string, Adjacency[]>,
  blocked: string,
): Map<string, { via: number | null }> {
  const seen = new Map<string, { via: number | null }>([[start, { via: null }]])
  const queue = [start]
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head]
    if (node === blocked && node !== start) continue
    for (const next of neighbours.get(node) ?? []) {
      if (seen.has(next.to)) continue
      seen.set(next.to, { via: next.edgeIndex })
      queue.push(next.to)
    }
  }
  return seen
}

function shortestWalksThroughEachEdge(
  edges: GraphEdge[],
  adjacency: Map<string, Adjacency[]>,
  reverse: Map<string, Adjacency[]>,
  entry: string,
  exit: string,
): number[][] {
  const forward = bfs(entry, adjacency, exit)
  const backward = bfs(exit, reverse, '')

  const prefixTo = (node: string): number[] => {
    const walk: number[] = []
    let current = node
    while (current !== entry) {
      const via = forward.get(current)!.via!
      walk.push(via)
      current = edges[via].from
    }
    return walk.reverse()
  }

  const suffixFrom = (node: string): number[] => {
    const walk: number[] = []
    let current = node
    while (current !== exit) {
      const via = backward.get(current)!.via!
      walk.push(via)
      current = edges[via].to
    }
    return walk
  }

  const walks: number[][] = []
  edges.forEach((edge, edgeIndex) => {
    if (edge.from === exit) return
    if (!forward.has(edge.from) || !backward.has(edge.to)) return
    const walk = [...prefixTo(edge.from), edgeIndex, ...suffixFrom(edge.to)]
    const usage = new Map<number, number>()
    for (const index of walk) usage.set(index, (usage.get(index) ?? 0) + 1)
    if ([...usage.values()].some((count) => count > MAX_EDGE_REUSE)) return
    walks.push(walk)
  })
  return walks
}

function enumeratePaths(
  adjacency: Map<string, Adjacency[]>,
  entry: string,
  exit: string,
): { paths: number[][]; steps: number; truncated: boolean } {
  const paths: number[][] = []
  const current: number[] = []
  const usage = new Map<number, number>()
  let steps = 0
  let truncated = false

  const walk = (node: string): void => {
    if (truncated) return
    if (node === exit) {
      paths.push([...current])
      if (paths.length >= MAX_PATHS) truncated = true
      return
    }

    for (const next of adjacency.get(node) ?? []) {
      steps += 1
      if (steps >= MAX_STEPS) {
        truncated = true
        return
      }
      const used = usage.get(next.edgeIndex) ?? 0
      if (used >= MAX_EDGE_REUSE) continue

      usage.set(next.edgeIndex, used + 1)
      current.push(next.edgeIndex)
      walk(next.to)
      current.pop()
      usage.set(next.edgeIndex, used)
      if (truncated) return
    }
  }

  walk(entry)
  return { paths, steps, truncated }
}

function gcd(a: bigint, b: bigint): bigint {
  let x = a < ZERO ? -a : a
  let y = b < ZERO ? -b : b
  while (y !== ZERO) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

export function selectIndependentPaths(
  paths: number[][],
  edgeCount: number,
  limit: number = Number.POSITIVE_INFINITY,
): number[][] {
  const basis = new Map<number, bigint[]>()
  const selected: number[][] = []

  for (const path of paths) {
    if (selected.length >= limit) break

    let vector: bigint[] = new Array<bigint>(edgeCount).fill(ZERO)
    for (const edgeIndex of path) vector[edgeIndex] += ONE

    for (;;) {
      const pivot = vector.findIndex((value) => value !== ZERO)
      if (pivot === -1) break

      const row = basis.get(pivot)
      if (!row) {
        basis.set(pivot, vector)
        selected.push(path)
        break
      }

      const a = row[pivot]
      const b = vector[pivot]
      let divisor = ZERO
      const next = vector.map((value, column) => {
        const combined = value * a - row[column] * b
        divisor = gcd(divisor, combined)
        return combined
      })
      vector = divisor > ONE ? next.map((value) => value / divisor) : next
    }
  }

  return selected
}

function buildTestCase(index: number, nodeSequence: string[]): SuggestedTestCase {
  return {
    id: `CP-${String(index + 1).padStart(2, '0')}`,
    path: nodeSequence.join(' -> '),
    precondition: 'Precondición por definir.',
    input: 'Datos de entrada por definir.',
    expected: 'Resultado esperado por definir.',
  }
}

function describeNodes(nodes: string[]): string {
  const shown = nodes.slice(0, 6).join(', ')
  return nodes.length > 6 ? `${shown} y ${nodes.length - 6} más` : shown
}

export function analyzeBasisPath(input: BasisPathInput): BasisPathOutcome {
  try {
    const { edges, nodes } = parseEdges(input.edges)
    const nodeSet = new Set(nodes)

    const adjacency = new Map<string, Adjacency[]>()
    const reverse = new Map<string, Adjacency[]>()
    const indegree = new Map<string, number>()
    const outdegree = new Map<string, number>()
    for (const node of nodes) {
      adjacency.set(node, [])
      reverse.set(node, [])
      indegree.set(node, 0)
      outdegree.set(node, 0)
    }

    edges.forEach((edge, edgeIndex) => {
      adjacency.get(edge.from)!.push({ to: edge.to, edgeIndex })
      reverse.get(edge.to)!.push({ to: edge.from, edgeIndex })
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

    const reachableFromEntry = bfs(entry, adjacency, exit)
    const unreachable = nodes.filter((node) => !reachableFromEntry.has(node))
    if (unreachable.length > 0) {
      throw new BasisPathError(
        `Hay nodos que no se alcanzan desde "${entry}": ${describeNodes(unreachable)}. Revisa la dirección de las aristas.`,
      )
    }

    const reachesExit = bfs(exit, reverse, '')
    const dead = nodes.filter((node) => !reachesExit.has(node))
    if (dead.length > 0) {
      throw new BasisPathError(
        `Hay nodos desde los que no se llega a "${exit}": ${describeNodes(dead)}. Cada nodo debe tener un camino hacia la salida.`,
      )
    }

    const nodeCount = nodes.length
    const edgeCount = edges.length
    const cyclomaticComplexity = edgeCount - nodeCount + 2 * componentCount

    const byLength = (a: number[], b: number[]) => a.length - b.length

    let candidates = shortestWalksThroughEachEdge(
      edges,
      adjacency,
      reverse,
      entry,
      exit,
    ).sort(byLength)
    let selected = selectIndependentPaths(
      candidates,
      edgeCount,
      cyclomaticComplexity,
    )
    let stepsUsed = 0
    let truncated = false

    if (selected.length < cyclomaticComplexity) {
      const enumerated = enumeratePaths(adjacency, entry, exit)
      stepsUsed += enumerated.steps
      truncated = enumerated.truncated
      const seen = new Set<string>()
      candidates = [...candidates, ...enumerated.paths]
        .filter((path) => {
          const key = path.join(',')
          if (seen.has(key)) return false
          seen.add(key)
          return true
        })
        .sort(byLength)
      selected = selectIndependentPaths(candidates, edgeCount, cyclomaticComplexity)
    }

    if (selected.length === 0) {
      throw new BasisPathError(
        `No existe un camino de "${entry}" a "${exit}". Revisa la dirección de las aristas.`,
      )
    }

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
        edgeIndices: path,
        length: path.length,
        testCase: buildTestCase(index, nodeSequence),
      }
    })

    return {
      ok: true,
      result: {
        nodes,
        edges,
        nodeCount,
        edgeCount,
        componentCount,
        cyclomaticComplexity,
        entry,
        exit,
        candidatesExplored: candidates.length,
        stepsUsed,
        truncated,
        rank: selected.length,
        expectedPathCount: cyclomaticComplexity,
        complete: selected.length === cyclomaticComplexity,
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
