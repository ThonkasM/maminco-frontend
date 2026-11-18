import type { BasicPath } from './basisPath'

const HEADERS = ['Caso', 'Camino', 'Precondición', 'Entrada', 'Resultado esperado']

function rowOf(path: BasicPath): string[] {
  const { id, path: sequence, precondition, input, expected } = path.testCase
  return [id, sequence, precondition, input, expected]
}

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

export function testCasesToCsv(paths: BasicPath[]): string {
  return [HEADERS, ...paths.map(rowOf)]
    .map((row) => row.map(csvCell).join(','))
    .join('\n')
}

function markdownCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ')
}

export function testCasesToMarkdown(paths: BasicPath[]): string {
  const header = `| ${HEADERS.join(' | ')} |`
  const divider = `| ${HEADERS.map(() => '---').join(' | ')} |`
  const body = paths.map((path) => `| ${rowOf(path).map(markdownCell).join(' | ')} |`)
  return [header, divider, ...body].join('\n')
}
