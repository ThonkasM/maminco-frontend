export interface BasisPathExample {
  id: string
  label: string
  entry: string
  exit: string
  edges: string
  nodes: number
  edgeCount: number
  complexity: number
}

export const BASIS_PATH_EXAMPLES: BasisPathExample[] = [
  {
    id: 'process-payment',
    label: 'PaymentsService.processPayment (11 decisiones)',
    entry: 'inicio',
    exit: 'FIN',
    nodes: 20,
    edgeCount: 30,
    complexity: 12,
    edges: `inicio -> D1
D1 -> FIN
D1 -> D2
D2 -> FIN
D2 -> D3
D3 -> FIN
D3 -> D4
D4 -> FIN
D4 -> D5
D5 -> FIN
D5 -> saldo
saldo -> D6
D6 -> parcial
D6 -> D7
D7 -> final
D7 -> D8
D8 -> final
D8 -> D9
D9 -> FIN
D9 -> final
final -> tx
parcial -> tx
tx -> D10
D10 -> auditoria
D10 -> D11
D11 -> FIN
D11 -> mesa
mesa -> auditoria
auditoria -> emitir
emitir -> FIN`,
  },
  {
    id: 'orders-create',
    label: 'OrdersService.create (9 decisiones)',
    entry: 'inicio',
    exit: 'FIN',
    nodes: 16,
    edgeCount: 24,
    complexity: 10,
    edges: `inicio -> D1
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
emitir -> FIN`,
  },
  {
    id: 'sequence',
    label: 'Secuencia',
    entry: 'A',
    exit: 'D',
    nodes: 4,
    edgeCount: 3,
    complexity: 1,
    edges: `A -> B
B -> C
C -> D`,
  },
  {
    id: 'if',
    label: 'Condicional if / else',
    entry: 'inicio',
    exit: 'FIN',
    nodes: 5,
    edgeCount: 5,
    complexity: 2,
    edges: `inicio -> D1
D1 -> verdadero
D1 -> falso
verdadero -> FIN
falso -> FIN`,
  },
  {
    id: 'while',
    label: 'Bucle while',
    entry: 'inicio',
    exit: 'FIN',
    nodes: 4,
    edgeCount: 4,
    complexity: 2,
    edges: `inicio -> D1
D1 -> cuerpo
cuerpo -> D1
D1 -> FIN`,
  },
]

export const DEFAULT_BASIS_PATH_EXAMPLE = BASIS_PATH_EXAMPLES[0]
