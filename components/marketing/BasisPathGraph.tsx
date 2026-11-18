import { cn } from '@/lib/utils/cn'
import type { BasisPathResult } from '@/lib/utils/basisPath'
import { NODE_HEIGHT, NODE_WIDTH, layoutGraph } from '@/lib/utils/basisPathLayout'

interface BasisPathGraphProps {
  result: BasisPathResult
  highlightedEdges: ReadonlySet<number>
  highlightedNodes: ReadonlySet<string>
}

function edgePath(
  from: { x: number; y: number },
  to: { x: number; y: number },
  index: number,
  isBack: boolean,
): string {
  const startY = from.y + NODE_HEIGHT / 2
  const endY = to.y - NODE_HEIGHT / 2
  if (isBack || to.y <= from.y) {
    const side = from.x >= to.x ? 1 : -1
    const bow = 70 + (index % 4) * 14
    const x1 = from.x + side * (NODE_WIDTH / 2)
    const x2 = to.x + side * (NODE_WIDTH / 2)
    return `M ${x1} ${from.y} C ${x1 + side * bow} ${from.y}, ${x2 + side * bow} ${to.y}, ${x2} ${to.y}`
  }
  const span = Math.max(1, Math.round((endY - startY) / 46))
  const bow = span > 1 ? (index % 2 === 0 ? 1 : -1) * (26 + span * 6) : 0
  const mid = (endY - startY) / 2
  return `M ${from.x} ${startY} C ${from.x + bow} ${startY + mid}, ${to.x + bow} ${endY - mid}, ${to.x} ${endY}`
}

export function BasisPathGraph({
  result,
  highlightedEdges,
  highlightedNodes,
}: BasisPathGraphProps) {
  const layout = layoutGraph(result.nodes, result.edges, result.entry, result.exit)
  const hasHighlight = highlightedEdges.size > 0
  const extra = 90
  const width = layout.width + extra * 2

  return (
    <div className="overflow-auto rounded-lg border border-border bg-surface">
      <svg
        role="img"
        aria-label={`Grafo de flujo con ${result.nodeCount} nodos y ${result.edgeCount} aristas`}
        viewBox={`${-extra} 0 ${width} ${layout.height}`}
        width={width}
        height={layout.height}
        className="mx-auto block max-w-none"
      >
        <defs>
          <marker id="bp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-muted-foreground" />
          </marker>
          <marker id="bp-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" className="fill-primary" />
          </marker>
        </defs>

        {result.edges.map((edge, index) => {
          const from = layout.positions.get(edge.from)!
          const to = layout.positions.get(edge.to)!
          const active = highlightedEdges.has(index)
          return (
            <path
              key={index}
              d={edgePath(from, to, index, layout.backEdges.has(index))}
              fill="none"
              strokeWidth={active ? 2.5 : 1.25}
              markerEnd={`url(#${active ? 'bp-arrow-active' : 'bp-arrow'})`}
              className={cn(
                active ? 'stroke-primary' : 'stroke-muted-foreground',
                hasHighlight && !active && 'opacity-25',
              )}
            />
          )
        })}

        {result.nodes.map((node) => {
          const position = layout.positions.get(node)!
          const active = highlightedNodes.has(node)
          const terminal = node === result.entry || node === result.exit
          return (
            <g key={node} transform={`translate(${position.x - NODE_WIDTH / 2} ${position.y - NODE_HEIGHT / 2})`}>
              <rect
                width={NODE_WIDTH}
                height={NODE_HEIGHT}
                rx={terminal ? NODE_HEIGHT / 2 : 6}
                strokeWidth={active ? 2 : 1}
                className={cn(
                  active ? 'fill-primary/15 stroke-primary' : 'fill-surface-muted stroke-border',
                  hasHighlight && !active && 'opacity-50',
                )}
              />
              <text
                x={NODE_WIDTH / 2}
                y={NODE_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                className="fill-foreground font-mono"
              >
                {node.length > 12 ? `${node.slice(0, 11)}…` : node}
              </text>
              <title>{node}</title>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
