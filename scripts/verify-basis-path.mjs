import assert from 'node:assert/strict'
import {
  analyzeBasisPath,
  selectIndependentPaths,
} from '../lib/utils/basisPath.ts'
import { BASIS_PATH_EXAMPLES } from '../lib/utils/basisPathExamples.ts'
import { testCasesToCsv, testCasesToMarkdown } from '../lib/utils/basisPathExport.ts'

function gcd(a, b) {
  a = a < 0n ? -a : a
  b = b < 0n ? -b : b
  while (b) [a, b] = [b, a % b]
  return a
}

function fraction(n, d = 1n) {
  if (d < 0n) [n, d] = [-n, -d]
  const g = gcd(n, d) || 1n
  return { n: n / g, d: d / g }
}

function rankOverRationals(rows, columns) {
  const matrix = rows.map((row) => row.map((value) => fraction(BigInt(value))))
  let rank = 0
  for (let col = 0; col < columns && rank < matrix.length; col++) {
    let pivot = -1
    for (let r = rank; r < matrix.length; r++) {
      if (matrix[r][col].n !== 0n) {
        pivot = r
        break
      }
    }
    if (pivot === -1) continue
    ;[matrix[rank], matrix[pivot]] = [matrix[pivot], matrix[rank]]
    for (let r = rank + 1; r < matrix.length; r++) {
      const factor = fraction(
        matrix[r][col].n * matrix[rank][col].d,
        matrix[r][col].d * matrix[rank][col].n,
      )
      for (let c = col; c < columns; c++) {
        matrix[r][c] = fraction(
          matrix[r][c].n * factor.d * matrix[rank][c].d -
            matrix[rank][c].n * factor.n * matrix[r][c].d,
          matrix[r][c].d * factor.d * matrix[rank][c].d,
        )
      }
    }
    rank++
  }
  return rank
}

function countVectors(paths, edgeCount) {
  return paths.map((path) => {
    const vector = new Array(edgeCount).fill(0)
    for (const index of path.edgeIndices) vector[index] += 1
    return vector
  })
}

let failures = 0
function check(name, fn) {
  try {
    fn()
    console.log(`PASS  ${name}`)
  } catch (error) {
    failures += 1
    console.log(`FAIL  ${name}\n      ${error.message}`)
  }
}

for (const example of BASIS_PATH_EXAMPLES) {
  check(`${example.label}`, () => {
    const outcome = analyzeBasisPath({
      edges: example.edges,
      entry: example.entry,
      exit: example.exit,
    })
    assert.ok(outcome.ok, outcome.ok ? '' : outcome.error)
    const { result } = outcome
    assert.equal(result.nodeCount, example.nodes, 'N')
    assert.equal(result.edgeCount, example.edgeCount, 'E')
    assert.equal(result.cyclomaticComplexity, example.edgeCount - example.nodes + 2, 'V = E - N + 2')
    assert.equal(result.cyclomaticComplexity, example.complexity, 'V esperado')
    assert.equal(result.paths.length, example.complexity, 'cantidad de caminos = V')
    assert.equal(result.complete, true)

    const rank = rankOverRationals(countVectors(result.paths, result.edgeCount), result.edgeCount)
    assert.equal(rank, example.complexity, 'rango sobre Q = V (independencia lineal)')

    for (const path of result.paths) {
      assert.equal(path.nodeSequence[0], result.entry)
      assert.equal(path.nodeSequence.at(-1), result.exit)
      path.edgeIndices.forEach((edgeIndex, i) => {
        assert.equal(result.edges[edgeIndex].from, path.nodeSequence[i])
        assert.equal(result.edges[edgeIndex].to, path.nodeSequence[i + 1])
      })
    }
    console.log(
      `      N=${result.nodeCount} E=${result.edgeCount} V=${result.cyclomaticComplexity} caminos=${result.paths.length} rango(Q)=${rank} pasos=${result.stepsUsed} candidatos=${result.candidatesExplored}`,
    )
  })
}

check('independencia sobre Q, no sobre GF(2): a+b=c solo mod 2', () => {
  const selected = selectIndependentPaths([[0, 1], [1, 2], [0, 2]], 3)
  assert.equal(selected.length, 3)
})

check('un camino repetido se descarta y una combinación no entera se conserva', () => {
  const selected = selectIndependentPaths([[0, 1], [1, 2], [0, 1], [0, 0, 1, 1, 1, 2]], 3)
  assert.equal(selected.length, 2)
})

check('grafos aleatorios con ciclos: rango sobre Q = V', () => {
  let seed = 12345
  const random = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
  let analyzed = 0
  for (let trial = 0; trial < 300; trial++) {
    const inner = 3 + Math.floor(random() * 8)
    const names = ['S', ...Array.from({ length: inner }, (_, i) => `n${i}`), 'T']
    const lines = []
    for (let i = 0; i < names.length - 1; i++) lines.push(`${names[i]} -> ${names[i + 1]}`)
    const extra = 1 + Math.floor(random() * 6)
    for (let k = 0; k < extra; k++) {
      const a = Math.floor(random() * (names.length - 1))
      const b = 1 + Math.floor(random() * (names.length - 1))
      if (a !== b) lines.push(`${names[a]} -> ${names[b]}`)
    }
    const outcome = analyzeBasisPath({ edges: lines.join('\n'), entry: 'S', exit: 'T' })
    assert.ok(outcome.ok, outcome.ok ? '' : outcome.error)
    const { result } = outcome
    const rank = rankOverRationals(countVectors(result.paths, result.edgeCount), result.edgeCount)
    assert.equal(rank, result.paths.length, `independencia en prueba ${trial}`)
    assert.equal(result.paths.length, result.cyclomaticComplexity, `V en prueba ${trial}:\n${lines.join('\n')}`)
    analyzed++
  }
  console.log(`      ${analyzed} grafos aleatorios verificados`)
})

check('grafo desconexo devuelve error claro', () => {
  const outcome = analyzeBasisPath({ edges: 'A -> B\nC -> D' })
  assert.equal(outcome.ok, false)
  assert.match(outcome.error, /no es conexo/)
})

check('línea con formato inválido', () => {
  const outcome = analyzeBasisPath({ edges: 'A - B' })
  assert.equal(outcome.ok, false)
  assert.match(outcome.error, /línea 1/)
})

check('nodo sin salida hacia el nodo final', () => {
  const outcome = analyzeBasisPath({ edges: 'A -> B\nB -> C\nB -> D', exit: 'C' })
  assert.equal(outcome.ok, false)
  assert.match(outcome.error, /no se llega a "C"/)
})

check('exportación CSV y Markdown', () => {
  const outcome = analyzeBasisPath({ edges: 'A -> B\nB -> C\nB -> D\nC -> E\nD -> E' })
  assert.ok(outcome.ok)
  const csv = testCasesToCsv(outcome.result.paths)
  const md = testCasesToMarkdown(outcome.result.paths)
  assert.equal(csv.split('\n').length, outcome.result.paths.length + 1)
  assert.match(md, /^\| Caso \| Camino/)
})

console.log(failures === 0 ? '\nTodas las verificaciones pasaron.' : `\n${failures} verificación(es) fallaron.`)
process.exit(failures === 0 ? 0 : 1)
