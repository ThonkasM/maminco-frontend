export interface LayoutEdge {
  from: string
  to: string
}

export interface NodePosition {
  x: number
  y: number
  layer: number
}

export interface GraphLayout {
  positions: Map<string, NodePosition>
  backEdges: Set<number>
  width: number
  height: number
}

export const NODE_WIDTH = 92
export const NODE_HEIGHT = 30
const COLUMN_GAP = 56
const ROW_GAP = 46
const MARGIN = 28

export function layoutGraph(
  nodes: string[],
  edges: LayoutEdge[],
  entry: string,
  exit: string,
): GraphLayout {
  const outgoing = new Map<string, number[]>(nodes.map((node) => [node, []]))
  edges.forEach((edge, index) => outgoing.get(edge.from)?.push(index))

  const backEdges = new Set<number>()
  const state = new Map<string, 'open' | 'done'>()
  const order: string[] = []

  const visit = (node: string) => {
    state.set(node, 'open')
    for (const index of outgoing.get(node) ?? []) {
      const target = edges[index].to
      const targetState = state.get(target)
      if (targetState === 'open' || target === entry) backEdges.add(index)
      else if (!targetState) visit(target)
    }
    state.set(node, 'done')
    order.push(node)
  }
  visit(entry)
  for (const node of nodes) if (!state.has(node)) visit(node)

  const layer = new Map<string, number>(nodes.map((node) => [node, 0]))
  for (const node of [...order].reverse()) {
    for (const index of outgoing.get(node) ?? []) {
      if (backEdges.has(index)) continue
      const target = edges[index].to
      layer.set(target, Math.max(layer.get(target)!, layer.get(node)! + 1))
    }
  }

  const deepest = Math.max(
    ...nodes.filter((node) => node !== exit).map((node) => layer.get(node)!),
    0,
  )
  layer.set(exit, Math.max(layer.get(exit)!, deepest + 1))

  const rows = new Map<number, string[]>()
  for (const node of nodes) {
    const level = layer.get(node)!
    rows.set(level, [...(rows.get(level) ?? []), node])
  }

  const widest = Math.max(...[...rows.values()].map((row) => row.length), 1)
  const width = MARGIN * 2 + widest * NODE_WIDTH + (widest - 1) * COLUMN_GAP
  const levels = Math.max(...rows.keys(), 0) + 1
  const height = MARGIN * 2 + levels * NODE_HEIGHT + (levels - 1) * ROW_GAP

  const positions = new Map<string, NodePosition>()
  for (const [level, row] of rows) {
    const rowWidth = row.length * NODE_WIDTH + (row.length - 1) * COLUMN_GAP
    const startX = (width - rowWidth) / 2 + NODE_WIDTH / 2
    row.forEach((node, column) => {
      positions.set(node, {
        x: startX + column * (NODE_WIDTH + COLUMN_GAP),
        y: MARGIN + NODE_HEIGHT / 2 + level * (NODE_HEIGHT + ROW_GAP),
        layer: level,
      })
    })
  }

  return { positions, backEdges, width, height }
}
